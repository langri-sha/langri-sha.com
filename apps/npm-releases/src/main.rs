mod changes;
mod github;
mod posthog;

use std::time::Duration;

use anyhow::{Result, bail};
use clap::{Parser, builder::NonEmptyStringValueParser};
use jiff::{RoundMode, Timestamp, TimestampRound, Unit};
use ureq::Agent;

/// Publishes pending npm package releases to PostHog.
#[derive(Parser)]
#[command(about)]
struct Args {
    /// npm user whose packages to report on.
    #[arg(long, default_value = "malkron")]
    maintainer: String,

    /// GitHub account whose repositories keep the change files.
    #[arg(long, default_value = "langri-sha")]
    owner: String,

    /// GitHub token to read the repositories with.
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
    let hour = hour(Timestamp::now())?;

    let agent: Agent = Agent::config_builder()
        .http_status_as_error(false)
        .timeout_global(Some(Duration::from_secs(60)))
        .user_agent("langri-sha.com/npm-releases")
        .build()
        .into();

    let packages = telemetry::npm::maintained_packages(&agent, &args.maintainer)?;

    if packages.is_empty() {
        bail!("npm lists no packages maintained by {}", args.maintainer);
    }

    let repositories = github::repositories(&agent, &args.github_token, &args.owner)?;
    let events = posthog::snapshot(&packages, changes::pending(&repositories)?, hour);

    for event in &events {
        println!("{}", serde_json::to_string(event)?);
    }

    Ok(())
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
    use super::*;

    #[test]
    fn hours_start_on_the_hour() {
        assert_eq!(
            hour("2026-10-06T15:59:59.999Z".parse().unwrap()).unwrap(),
            "2026-10-06T15:00:00Z".parse::<Timestamp>().unwrap(),
        );
    }
}
