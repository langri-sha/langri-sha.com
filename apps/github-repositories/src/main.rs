mod github;
mod posthog;

use std::time::{Duration, Instant};

use anyhow::{Result, bail};
use clap::{Parser, builder::NonEmptyStringValueParser};
use jiff::{Timestamp, ToSpan, civil::Date, tz::TimeZone};
use telemetry::github::{Access, App};
use ureq::Agent;

use crate::{
    github::Repository,
    posthog::{Event, Referrers, Run, Starred, Stars},
};

/// What the App's tokens may read. Traffic takes administration, which shows
/// settings such as branch protection too; nothing narrower serves it.
const PERMISSIONS: &[(&str, Access)] =
    &[("administration", Access::Read), ("metadata", Access::Read)];

/// What the App's token for stars may do. GitHub only lists stargazers to a
/// token that may write contents, and refuses one that reads them, so this one
/// is limited to the repositories the job reports on and only reads
/// stargazers.
const STARGAZER_PERMISSIONS: &[(&str, Access)] =
    &[("contents", Access::Write), ("metadata", Access::Read)];

/// Publishes daily GitHub repository traffic and stars to PostHog.
#[derive(Parser)]
#[command(about)]
struct Args {
    /// GitHub account whose repositories to report on.
    #[arg(long, default_value = "langri-sha")]
    owner: String,

    /// GitHub token to read the repositories with, in place of the App's. Only
    /// those with push access to a repository see its traffic.
    #[arg(
        long,
        env = "GITHUB_TOKEN",
        hide_env_values = true,
        required_unless_present_all = ["github_app_client_id", "github_app_private_key"],
        value_parser = NonEmptyStringValueParser::new(),
    )]
    github_token: Option<String>,

    /// Client ID of the GitHub App to read the repositories as.
    #[arg(
        long,
        env = "GITHUB_APP_CLIENT_ID",
        requires = "github_app_private_key",
        value_parser = NonEmptyStringValueParser::new(),
    )]
    github_app_client_id: Option<String>,

    /// Private key of the GitHub App, in PEM.
    #[arg(
        long,
        env = "GITHUB_APP_PRIVATE_KEY",
        hide_env_values = true,
        requires = "github_app_client_id",
        value_parser = NonEmptyStringValueParser::new(),
    )]
    github_app_private_key: Option<String>,

    /// PostHog ingestion host.
    #[arg(long, env = "POSTHOG_HOST", default_value = "https://eu.i.posthog.com")]
    posthog_host: String,

    /// PostHog project token.
    #[arg(
        long,
        env = "POSTHOG_PROJECT_TOKEN",
        hide_env_values = true,
        required_unless_present = "dry_run",
        value_parser = NonEmptyStringValueParser::new(),
    )]
    posthog_project_token: Option<String>,

    /// Print the events instead of sending them.
    #[arg(long)]
    dry_run: bool,

    /// Send only the days from then, as an import: to load the 14 days GitHub
    /// keeps, or make up for days the job missed. The day the run sends is
    /// left to the daily run.
    #[arg(long)]
    from: Option<Date>,

    /// Send only the stars given since then, as an import: to load their
    /// history, or make up for days the job missed. Stars given yesterday, in
    /// UTC, are left to the daily run.
    #[arg(long)]
    starred_since: Option<Timestamp>,
}

fn main() -> Result<()> {
    let started = Instant::now();
    let args = Args::parse();
    let today = Timestamp::now().to_zoned(TimeZone::UTC).date();
    let day = day(today)?;

    let agent: Agent = Agent::config_builder()
        .http_status_as_error(false)
        .timeout_global(Some(Duration::from_secs(60)))
        .user_agent("langri-sha.com/github-repositories")
        .build()
        .into();

    let credential = credential(&args);
    let credential_kind = credential.kind();
    let (token, app) = match credential {
        Credential::Token(token) => (token, None),
        Credential::App {
            client_id,
            private_key,
        } => {
            let app = App::new(&client_id, &private_key)?;
            let token = app.installation_token(&agent, &args.owner, PERMISSIONS, &[])?;

            (token, Some(app))
        }
    };

    let repositories = github::repositories(&agent, &token, &args.owner)?;

    if repositories.is_empty() {
        bail!(
            "GitHub lists no public repositories owned by {}",
            args.owner
        );
    }

    if args.from.is_some() || args.starred_since.is_some() {
        return import(
            &agent,
            &args,
            &token,
            app.as_ref(),
            &repositories,
            day,
            today,
        );
    }

    let events = traffic(&agent, &token, &repositories, day, day)?;
    let referrers = referrers(&agent, &token, &repositories, today)?;
    let stargazers_token =
        stargazers_token(&agent, &args.owner, &token, app.as_ref(), &repositories)?;
    // The day before, fixed by the calendar so that each star is sent once.
    let (stars, starred) = stargazers(
        &agent,
        &stargazers_token,
        &args.owner,
        &repositories,
        today,
        midnight(today.yesterday()?)?,
        midnight(today)?,
    )?;
    let run = Run::new(
        day,
        repositories.len(),
        events.len() + referrers.len() + stars.len() + starred.len(),
        credential_kind,
        started.elapsed(),
    );

    match args.posthog_project_token {
        Some(token) if !args.dry_run => {
            telemetry::posthog::capture(&agent, &args.posthog_host, &token, &events, false)?;
            telemetry::posthog::capture(&agent, &args.posthog_host, &token, &referrers, false)?;
            telemetry::posthog::capture(&agent, &args.posthog_host, &token, &stars, false)?;
            telemetry::posthog::capture(&agent, &args.posthog_host, &token, &starred, false)?;
            telemetry::posthog::capture(&agent, &args.posthog_host, &token, &[run], false)?;

            eprintln!(
                "Published traffic to {} repositories for {day}, where their visitors come from, their stars, and {} stars given yesterday",
                events.len(),
                starred.len(),
            );
        }
        _ => {
            for event in &events {
                println!("{}", serde_json::to_string(event)?);
            }

            for event in &referrers {
                println!("{}", serde_json::to_string(event)?);
            }

            for event in &stars {
                println!("{}", serde_json::to_string(event)?);
            }

            for event in &starred {
                println!("{}", serde_json::to_string(event)?);
            }

            println!("{}", serde_json::to_string(&run)?);
        }
    }

    Ok(())
}

/// Send the days from `--from` and the stars given since `--starred-since`
/// through PostHog's pipeline for imports, which spares them the rate limit
/// live events see.
fn import(
    agent: &Agent,
    args: &Args,
    token: &str,
    app: Option<&App>,
    repositories: &[Repository],
    day: Date,
    today: Date,
) -> Result<()> {
    let days = match args.from {
        Some(from) => Some((from, import_to(from, day)?)),
        None => None,
    };
    let times = match args.starred_since {
        Some(since) => Some((since, starred_until(since, today)?)),
        None => None,
    };

    let events = match days {
        Some((from, to)) => traffic(agent, token, repositories, from, to)?,
        None => Vec::new(),
    };
    let starred = match times {
        Some((since, until)) => {
            let token = stargazers_token(agent, &args.owner, token, app, repositories)?;

            let (_, starred) = stargazers(
                agent,
                &token,
                &args.owner,
                repositories,
                today,
                since,
                until,
            )?;

            starred
        }
        None => Vec::new(),
    };

    match &args.posthog_project_token {
        Some(token) if !args.dry_run => {
            if let Some((from, to)) = days {
                telemetry::posthog::capture(agent, &args.posthog_host, token, &events, true)?;

                eprintln!(
                    "Imported {} events for {} repositories, {from} to {to}",
                    events.len(),
                    repositories.len(),
                );
            }

            if let Some((since, until)) = times {
                telemetry::posthog::capture(agent, &args.posthog_host, token, &starred, true)?;

                eprintln!(
                    "Imported {} stars given from {since} until {until}",
                    starred.len()
                );
            }
        }
        _ => {
            for event in &events {
                println!("{}", serde_json::to_string(event)?);
            }

            for event in &starred {
                println!("{}", serde_json::to_string(event)?);
            }
        }
    }

    Ok(())
}

/// Where an import ends: at the day before the run's, which the daily run
/// sends itself, whether it has run yet or not.
fn import_to(from: Date, day: Date) -> Result<Date> {
    let to = day.yesterday()?;

    if from > to {
        bail!("--from {from} is not before {day}, which the daily run sends");
    }

    Ok(to)
}

#[derive(Debug, PartialEq)]
enum Credential {
    Token(String),
    App {
        client_id: String,
        private_key: String,
    },
}

impl Credential {
    fn kind(&self) -> &'static str {
        match self {
            Credential::Token(_) => "token",
            Credential::App { .. } => "app",
        }
    }
}

/// What to read the repositories with: a token when given one, as when run by
/// hand, or else the App.
fn credential(args: &Args) -> Credential {
    match (
        &args.github_token,
        &args.github_app_client_id,
        &args.github_app_private_key,
    ) {
        (Some(token), _, _) => Credential::Token(token.clone()),
        (None, Some(client_id), Some(private_key)) => Credential::App {
            client_id: client_id.clone(),
            private_key: private_key.clone(),
        },
        _ => unreachable!("clap requires a token or both of the App's credentials"),
    }
}

/// Each repository's traffic on the days from `from` to `to`.
fn traffic(
    agent: &Agent,
    token: &str,
    repositories: &[Repository],
    from: Date,
    to: Date,
) -> Result<Vec<Event>> {
    let mut events = Vec::new();

    for repository in repositories {
        let days = github::traffic(agent, token, &repository.name, from, to)?;

        if days.is_empty() {
            eprintln!(
                "GitHub has no traffic counts for {}, skipping",
                repository.name
            );
        }

        events.extend(
            days.into_iter()
                .map(|(day, traffic)| Event::new(repository, day, traffic)),
        );
    }

    Ok(events)
}

/// Where each repository's visitors come from, as GitHub ranks them on the day
/// of the run. GitHub keeps no history of them, so they can't be imported.
fn referrers(
    agent: &Agent,
    token: &str,
    repositories: &[Repository],
    today: Date,
) -> Result<Vec<Referrers>> {
    repositories
        .iter()
        .map(|repository| {
            let popular = github::popular(agent, token, &repository.name)?;

            Ok(Referrers::new(repository, today, popular))
        })
        .collect()
}

/// Where a stars import ends: at the start of yesterday, in UTC, whose stars
/// the daily run sends itself, whether it has run yet or not.
fn starred_until(since: Timestamp, today: Date) -> Result<Timestamp> {
    let until = midnight(today.yesterday()?)?;

    if since >= until {
        bail!("--starred-since {since} is not before {until}, where the daily run takes over");
    }

    Ok(until)
}

/// A token to list stargazers with: the one given when run by hand, or else one
/// from the App, limited to the repositories the job reports on.
fn stargazers_token(
    agent: &Agent,
    owner: &str,
    token: &str,
    app: Option<&App>,
    repositories: &[Repository],
) -> Result<String> {
    let Some(app) = app else {
        return Ok(token.to_owned());
    };

    let names: Vec<_> = repositories
        .iter()
        .filter_map(|repository| repository.name.split_once('/'))
        .map(|(_, name)| name)
        .collect();

    app.installation_token(agent, owner, STARGAZER_PERMISSIONS, &names)
}

/// Each repository's stars, forks and watchers on `day`, and the stars given
/// to it from `from` up to `until`.
fn stargazers(
    agent: &Agent,
    token: &str,
    owner: &str,
    repositories: &[Repository],
    day: Date,
    from: Timestamp,
    until: Timestamp,
) -> Result<(Vec<Stars>, Vec<Starred>)> {
    let mut stars = Vec::new();
    let mut starred = Vec::new();

    for repository in repositories {
        let stargazers = github::stars(agent, token, &repository.name, from)?;

        stars.push(Stars::new(repository, stargazers.total, day));
        starred.extend(
            stargazers
                .stars
                .into_iter()
                .filter(|star| star.at < until)
                .map(|star| Starred::new(repository, star, owner)),
        );
    }

    Ok((stars, starred))
}

fn midnight(day: Date) -> Result<Timestamp> {
    Ok(day.to_zoned(TimeZone::UTC)?.timestamp())
}

/// The day a run sends, fixed by the calendar so that each day is sent once.
///
/// GitHub counts each repository's traffic on a schedule of its own, and hours
/// into a day some repositories still lack the day before, so a run sends the
/// day before yesterday.
fn day(today: Date) -> Result<Date> {
    Ok(today.checked_sub(2.days())?)
}

#[cfg(test)]
mod tests {
    use clap::{CommandFactory, FromArgMatches};
    use jiff::civil::date;

    use super::*;

    /// Parses arguments alone, without the environment a test runs in.
    fn parse(args: &[&str]) -> Result<Args, clap::Error> {
        let matches = Args::command()
            .mut_args(|arg| arg.env(None))
            .try_get_matches_from(["github-repositories", "--dry-run"].iter().chain(args))?;

        Args::from_arg_matches(&matches)
    }

    #[test]
    fn reads_with_a_token_or_the_app() {
        let app_args = [
            "--github-app-client-id",
            "Iv23li8Mal7heKr0n",
            "--github-app-private-key",
            "key",
        ];
        let app = Credential::App {
            client_id: "Iv23li8Mal7heKr0n".to_owned(),
            private_key: "key".to_owned(),
        };

        assert_eq!(
            credential(&parse(&["--github-token", "ghp_x"]).unwrap()),
            Credential::Token("ghp_x".to_owned()),
        );
        assert_eq!(credential(&parse(&app_args).unwrap()), app);
        assert_eq!(
            credential(&parse(&[&["--github-token", "ghp_x"][..], &app_args].concat()).unwrap()),
            Credential::Token("ghp_x".to_owned()),
        );
        assert!(parse(&[]).is_err());
        assert!(parse(&app_args[..2]).is_err());
        assert!(parse(&app_args[2..]).is_err());
    }

    #[test]
    fn runs_send_the_day_before_yesterday() {
        assert_eq!(day(date(2026, 10, 8)).unwrap(), date(2026, 10, 6));
    }

    #[test]
    fn imports_stop_where_the_daily_run_starts() {
        let day = date(2026, 10, 6);

        assert_eq!(
            import_to(date(2026, 9, 23), day).unwrap(),
            date(2026, 10, 5)
        );
        assert!(import_to(day, day).is_err());
    }

    #[test]
    fn star_imports_stop_where_the_daily_run_starts() {
        let today = date(2026, 10, 8);

        assert_eq!(
            starred_until("2016-11-11T00:00:00Z".parse().unwrap(), today).unwrap(),
            "2026-10-07T00:00:00Z".parse::<Timestamp>().unwrap(),
        );
        assert!(starred_until("2026-10-07T00:00:00Z".parse().unwrap(), today).is_err());
    }
}
