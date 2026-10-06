mod changes;
mod github;
mod posthog;

use std::{
    sync::{
        Arc,
        atomic::{AtomicU32, Ordering},
    },
    time::{Duration, Instant},
};

use anyhow::{Result, bail};
use clap::{Parser, builder::NonEmptyStringValueParser};
use jiff::{RoundMode, Timestamp, TimestampRound, Unit};
use ureq::{Agent, SendBody, http::Request, middleware::MiddlewareNext};

use crate::posthog::{Requests, Run};

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
    let npm = Requests {
        count: npm_requests.load(Ordering::Relaxed),
        took: npm_started.elapsed(),
    };

    if packages.is_empty() {
        bail!("npm lists no packages maintained by {}", args.maintainer);
    }

    let (repositories, github) = github::repositories(&agent, &args.github_token, &args.owner)?;
    let events = posthog::snapshot(&packages, changes::pending(&repositories)?, hour);
    let run = Run::new(
        hour,
        repositories.len(),
        events.len(),
        &github,
        &npm,
        started.elapsed(),
    );

    match args.posthog_project_token {
        Some(token) if !args.dry_run => {
            telemetry::posthog::capture(&agent, &args.posthog_host, &token, &events, false)?;
            telemetry::posthog::capture(&agent, &args.posthog_host, &token, &[run], false)?;

            eprintln!(
                "Published pending changes of {} packages for {hour}",
                events.len()
            );
        }
        _ => {
            for event in &events {
                println!("{}", serde_json::to_string(event)?);
            }

            println!("{}", serde_json::to_string(&run)?);
        }
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
