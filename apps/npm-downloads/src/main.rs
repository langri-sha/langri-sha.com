mod npm;
mod posthog;

use std::time::Duration;

use anyhow::{Result, bail};
use clap::{Parser, builder::NonEmptyStringValueParser};
use jiff::{Timestamp, ToSpan, civil::Date, tz::TimeZone};
use ureq::Agent;

use crate::posthog::{Event, Run};

/// Publishes daily npm package downloads to PostHog.
#[derive(Parser)]
#[command(about)]
struct Args {
    /// npm user whose packages to count.
    #[arg(long, default_value = "malkron")]
    maintainer: String,

    /// First day to publish. Defaults to `--to`.
    #[arg(long)]
    from: Option<Date>,

    /// Last day to publish. Defaults to the day before yesterday, in UTC.
    #[arg(long)]
    to: Option<Date>,

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
    let args = Args::parse();

    let agent: Agent = Agent::config_builder()
        .http_status_as_error(false)
        .timeout_global(Some(Duration::from_secs(60)))
        .user_agent("langri-sha.com-org/npm-downloads")
        .build()
        .into();

    let today = Timestamp::now().to_zoned(TimeZone::UTC).date();
    let (from, to) = days(args.from, args.to, today, npm::last_counted_day(&agent)?)?;
    let backfill = args.from.is_some();

    let packages = telemetry::npm::maintained_packages(&agent, &args.maintainer)?;

    if packages.is_empty() {
        bail!("npm lists no packages maintained by {}", args.maintainer);
    }

    let mut events = Vec::new();

    for package in &packages {
        let downloads = npm::daily_downloads(&agent, &package.name, from, to)?;

        if downloads.is_empty() {
            eprintln!("npm has no downloads for {}, skipping", package.name);
        }

        events.extend(
            downloads
                .into_iter()
                .map(|(day, downloads)| Event::new(package, day, downloads)),
        );
    }

    match args.posthog_project_token {
        Some(token) if !args.dry_run => {
            telemetry::posthog::capture(&agent, &args.posthog_host, &token, &events, backfill)?;
            telemetry::posthog::capture(
                &agent,
                &args.posthog_host,
                &token,
                &[Run::new(from, to, events.len())],
                false,
            )?;

            eprintln!(
                "Published {} events for {} packages, {from} to {to}",
                events.len(),
                packages.len(),
            );
        }
        _ => {
            for event in &events {
                println!("{}", serde_json::to_string(event)?);
            }
        }
    }

    Ok(())
}

/// The days to publish, from first to last.
///
/// npm takes over a day to count one, and reports zero downloads for days it
/// has yet to count rather than leaving them out. Each run therefore publishes
/// a day it has long finished, fixed by the calendar so that a day is sent
/// once however late npm runs, and refuses any it has not counted.
fn days(from: Option<Date>, to: Option<Date>, today: Date, counted: Date) -> Result<(Date, Date)> {
    let to = match to {
        Some(to) => to,
        None => today.checked_sub(2.days())?,
    };
    let from = from.unwrap_or(to);

    if from > to {
        bail!("--from {from} is after --to {to}");
    }

    if to > counted {
        bail!("npm has counted downloads up to {counted}, not {to} yet");
    }

    Ok((from, to))
}

#[cfg(test)]
mod tests {
    use jiff::civil::date;

    use super::*;

    const TODAY: Date = date(2026, 10, 3);

    #[test]
    fn days_default_to_the_day_before_yesterday() {
        assert_eq!(
            days(None, None, TODAY, date(2026, 10, 1)).unwrap(),
            (date(2026, 10, 1), date(2026, 10, 1)),
        );
    }

    #[test]
    fn days_fill_in_a_missing_bound() {
        assert_eq!(
            days(None, Some(date(2026, 9, 1)), TODAY, date(2026, 10, 1)).unwrap(),
            (date(2026, 9, 1), date(2026, 9, 1)),
        );
        assert_eq!(
            days(Some(date(2026, 1, 1)), None, TODAY, date(2026, 10, 1)).unwrap(),
            (date(2026, 1, 1), date(2026, 10, 1)),
        );
    }

    #[test]
    fn days_npm_has_yet_to_count_are_refused() {
        assert!(days(None, None, TODAY, date(2026, 9, 30)).is_err());
    }

    #[test]
    fn days_out_of_order_are_refused() {
        assert!(days(Some(date(2026, 9, 2)), Some(date(2026, 9, 1)), TODAY, TODAY).is_err());
    }
}
