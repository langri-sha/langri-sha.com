mod app;
mod changes;
mod github;
mod npm;
mod posthog;
mod publishes;

use std::{
    sync::{
        Arc,
        atomic::{AtomicU32, Ordering},
    },
    time::{Duration, Instant},
};

use anyhow::{Result, bail};
use clap::{Parser, builder::NonEmptyStringValueParser};
use jiff::{RoundMode, Timestamp, TimestampRound, ToSpan, Unit};
use telemetry::npm::Package;
use ureq::{Agent, SendBody, http::Request, middleware::MiddlewareNext};

use crate::{
    app::App,
    posthog::{Published, Requests, Run},
};

/// Publishes npm package releases, pending and published, to PostHog.
#[derive(Parser)]
#[command(about)]
struct Args {
    /// npm user whose packages to report on.
    #[arg(long, default_value = "malkron")]
    maintainer: String,

    /// GitHub account whose repositories keep the change files.
    #[arg(long, default_value = "langri-sha")]
    owner: String,

    /// GitHub token to read the repositories with, in place of the App's.
    #[arg(
        long,
        env = "GITHUB_TOKEN",
        hide_env_values = true,
        required_unless_present_all = ["github_app_client_id", "github_app_private_key"],
        required_unless_present_any = ["published_since"],
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

    /// Send only the versions npm published since then, as an import: to load
    /// their history, or make up for hours the job missed. The hour before the
    /// run's is left to the hourly run.
    #[arg(long)]
    published_since: Option<Timestamp>,
}

fn main() -> Result<()> {
    let started = Instant::now();
    let args = Args::parse();
    let hour = hour(Timestamp::now())?;

    let npm_requests = Arc::new(AtomicU32::new(0));
    let counter = Arc::clone(&npm_requests);

    let agent: Agent = Agent::config_builder()
        .http_status_as_error(false)
        .timeout_global(Some(Duration::from_secs(60)))
        .user_agent("langri-sha.com/npm-releases")
        .middleware(move |request: Request<SendBody>, next: MiddlewareNext| {
            if request.uri().host() == Some("registry.npmjs.org") {
                counter.fetch_add(1, Ordering::Relaxed);
            }

            next.handle(request)
        })
        .build()
        .into();

    let npm_started = Instant::now();
    let packages = telemetry::npm::maintained_packages(&agent, &args.maintainer)?;

    if packages.is_empty() {
        bail!("npm lists no packages maintained by {}", args.maintainer);
    }

    if let Some(since) = args.published_since {
        return import(&agent, &args, &packages, since, hour);
    }

    // The hour before the run's, fixed by the calendar so that each version is
    // sent once: PostHog can take days to merge a duplicate away. npm caches
    // packuments for five minutes, so by :07 they show the whole hour.
    let published = published(&agent, &packages, hour.checked_sub(1.hour())?, hour)?;
    let npm = Requests {
        count: npm_requests.load(Ordering::Relaxed),
        took: npm_started.elapsed(),
    };

    let credential = credential(&args);
    let credential_kind = credential.kind();
    let token = match credential {
        Credential::Token(token) => token,
        Credential::App {
            client_id,
            private_key,
        } => App::new(&client_id, &private_key)?.installation_token(&agent, &args.owner)?,
    };

    let (repositories, github) = github::repositories(&agent, &token, &args.owner)?;
    let events = posthog::snapshot(&packages, changes::pending(&repositories)?, hour);
    let run = Run::new(
        hour,
        repositories.len(),
        events.len(),
        credential_kind,
        &github,
        &npm,
        started.elapsed(),
    );

    match args.posthog_project_token {
        Some(token) if !args.dry_run => {
            telemetry::posthog::capture(&agent, &args.posthog_host, &token, &events, false)?;
            telemetry::posthog::capture(&agent, &args.posthog_host, &token, &published, false)?;
            telemetry::posthog::capture(&agent, &args.posthog_host, &token, &[run], false)?;

            eprintln!(
                "Published pending changes of {} packages for {hour}, and {} npm publishes",
                events.len(),
                published.len(),
            );
        }
        _ => {
            for event in &events {
                println!("{}", serde_json::to_string(event)?);
            }

            for event in &published {
                println!("{}", serde_json::to_string(event)?);
            }

            println!("{}", serde_json::to_string(&run)?);
        }
    }

    Ok(())
}

/// Send the versions npm published from `since` through PostHog's pipeline for
/// imports, which spares them the rate limit live events see.
fn import(
    agent: &Agent,
    args: &Args,
    packages: &[Package],
    since: Timestamp,
    hour: Timestamp,
) -> Result<()> {
    let until = import_until(since, hour)?;
    let published = published(agent, packages, since, until)?;

    match &args.posthog_project_token {
        Some(token) if !args.dry_run => {
            telemetry::posthog::capture(agent, &args.posthog_host, token, &published, true)?;

            eprintln!(
                "Imported {} npm publishes from {since} until {until}",
                published.len()
            );
        }
        _ => {
            for event in &published {
                println!("{}", serde_json::to_string(event)?);
            }
        }
    }

    Ok(())
}

/// Where an import ends: at the hour before the run's, which the hourly run
/// sends itself, whether it has run yet or not.
fn import_until(since: Timestamp, hour: Timestamp) -> Result<Timestamp> {
    let until = hour.checked_sub(1.hour())?;

    if since >= until {
        bail!("--published-since {since} is not before {until}, where the hourly run takes over");
    }

    Ok(until)
}

/// The versions of each package npm published from `from` up to `to`.
fn published(
    agent: &Agent,
    packages: &[Package],
    from: Timestamp,
    to: Timestamp,
) -> Result<Vec<Published>> {
    let mut published = Vec::new();

    for package in packages {
        let history = npm::history(agent, &package.name)?;

        published.extend(
            publishes::between(&history, from, to)
                .iter()
                .map(|release| Published::new(package, release)),
        );
    }

    Ok(published)
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

/// The hour a run reports pending changes for. It is taken once, so that a run
/// straddling the hour reports every package for the same one.
fn hour(now: Timestamp) -> Result<Timestamp> {
    Ok(now.round(
        TimestampRound::new()
            .smallest(Unit::Hour)
            .mode(RoundMode::Trunc),
    )?)
}

#[cfg(test)]
mod tests {
    use clap::{CommandFactory, FromArgMatches};

    use super::*;

    /// Parses arguments alone, without the environment a test runs in.
    fn parse(args: &[&str]) -> Result<Args, clap::Error> {
        let matches = Args::command()
            .mut_args(|arg| arg.env(None))
            .try_get_matches_from(["npm-releases", "--dry-run"].iter().chain(args))?;

        Args::from_arg_matches(&matches)
    }

    fn app() -> Credential {
        Credential::App {
            client_id: "Iv23li8Mal7heKr0n".to_owned(),
            private_key: "key".to_owned(),
        }
    }

    #[test]
    fn reads_with_a_token_or_the_app() {
        let app_args = [
            "--github-app-client-id",
            "Iv23li8Mal7heKr0n",
            "--github-app-private-key",
            "key",
        ];

        assert_eq!(
            credential(&parse(&["--github-token", "ghp_x"]).unwrap()),
            Credential::Token("ghp_x".to_owned()),
        );
        assert_eq!(credential(&parse(&app_args).unwrap()), app());
        assert_eq!(
            credential(&parse(&[&["--github-token", "ghp_x"][..], &app_args].concat()).unwrap()),
            Credential::Token("ghp_x".to_owned()),
        );
        assert!(parse(&[]).is_err());
        assert!(parse(&app_args[..2]).is_err());
        assert!(parse(&app_args[2..]).is_err());
    }

    #[test]
    fn imports_need_no_credentials() {
        assert!(parse(&["--published-since", "2016-11-11T00:00:00Z"]).is_ok());
    }

    #[test]
    fn imports_stop_where_the_hourly_run_starts() {
        let hour = "2026-10-06T15:00:00Z".parse().unwrap();

        assert_eq!(
            import_until("2016-11-11T00:00:00Z".parse().unwrap(), hour).unwrap(),
            "2026-10-06T14:00:00Z".parse::<Timestamp>().unwrap(),
        );
        assert!(import_until("2026-10-06T14:00:00Z".parse().unwrap(), hour).is_err());
    }

    #[test]
    fn hours_start_on_the_hour() {
        assert_eq!(
            hour("2026-10-06T15:59:59.999Z".parse().unwrap()).unwrap(),
            "2026-10-06T15:00:00Z".parse::<Timestamp>().unwrap(),
        );
    }
}
