mod github;
mod posthog;

use std::time::Duration;

use anyhow::{Result, bail};
use clap::{Parser, builder::NonEmptyStringValueParser};
use jiff::{Timestamp, ToSpan, civil::Date, tz::TimeZone};
use ureq::Agent;

use crate::{github::Repository, posthog::Event};

/// Publishes daily GitHub repository traffic to PostHog.
#[derive(Parser)]
#[command(about)]
struct Args {
    /// GitHub account whose repositories to report on.
    #[arg(long, default_value = "langri-sha")]
    owner: String,

    /// GitHub token to read the repositories with. Only those with push access
    /// to a repository see its traffic.
    #[arg(
        long,
        env = "GITHUB_TOKEN",
        hide_env_values = true,
        value_parser = NonEmptyStringValueParser::new(),
    )]
    github_token: String,
}

fn main() -> Result<()> {
    let args = Args::parse();
    let day = day(Timestamp::now().to_zoned(TimeZone::UTC).date())?;

    let agent: Agent = Agent::config_builder()
        .http_status_as_error(false)
        .timeout_global(Some(Duration::from_secs(60)))
        .user_agent("langri-sha.com/github-repositories")
        .build()
        .into();

    let repositories = github::repositories(&agent, &args.github_token, &args.owner)?;

    if repositories.is_empty() {
        bail!(
            "GitHub lists no public repositories owned by {}",
            args.owner
        );
    }

    let events = traffic(&agent, &args.github_token, &repositories, day, day)?;

    for event in &events {
        println!("{}", serde_json::to_string(event)?);
    }

    Ok(())
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
    use jiff::civil::date;

    use super::*;

    #[test]
    fn runs_send_the_day_before_yesterday() {
        assert_eq!(day(date(2026, 10, 8)).unwrap(), date(2026, 10, 6));
    }
}
