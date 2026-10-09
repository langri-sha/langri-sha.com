mod npm;
mod posthog;

use std::time::Duration;

use anyhow::{Result, bail};
use clap::{Parser, builder::NonEmptyStringValueParser};
use jiff::{Timestamp, ToSpan, civil::Date, tz::TimeZone};
use ureq::Agent;

use crate::posthog::{Event, Run};

/// How many trailing days each run publishes. npm counts a day gradually and
/// reports zero for whatever it has yet to count, so a run sends the days still
/// being counted again until they have their final numbers. A week covers the
/// lag npm has shown.
const WINDOW: i32 = 7;

/// Publishes daily npm package downloads to PostHog.
#[derive(Parser)]
#[command(about)]
struct Args {
    /// npm user whose packages to count.
    #[arg(long, default_value = "malkron")]
    maintainer: String,

    /// First day to publish. Defaults to the start of the trailing window
    /// that ends on `--to`.
    #[arg(long)]
    from: Option<Date>,

    /// Last day to publish. Defaults to yesterday, in UTC.
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
    let (from, to) = days(args.from, args.to, today)?;
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
/// Without bounds this is the trailing window of days ending yesterday. Every
/// run sends the whole window, so a day npm counts late is sent again with its
/// final count, and a day it counts in part is corrected as the rest arrives.
fn days(from: Option<Date>, to: Option<Date>, today: Date) -> Result<(Date, Date)> {
    let to = match to {
        Some(to) => to,
        None => today.yesterday()?,
    };
    let from = match from {
        Some(from) => from,
        None => to.checked_sub((WINDOW - 1).days())?,
    };

    if from > to {
        bail!("--from {from} is after --to {to}");
    }

    Ok((from, to))
}

#[cfg(test)]
mod tests {
    use jiff::civil::date;

    use super::*;

    const TODAY: Date = date(2026, 10, 9);

    #[test]
    fn days_default_to_the_window_ending_yesterday() {
        assert_eq!(
            days(None, None, TODAY).unwrap(),
            (date(2026, 10, 2), date(2026, 10, 8)),
        );
    }

    #[test]
    fn days_fill_in_a_missing_bound() {
        assert_eq!(
            days(None, Some(date(2026, 9, 10)), TODAY).unwrap(),
            (date(2026, 9, 4), date(2026, 9, 10)),
        );
        assert_eq!(
            days(Some(date(2026, 1, 1)), None, TODAY).unwrap(),
            (date(2026, 1, 1), date(2026, 10, 8)),
        );
    }

    #[test]
    fn days_keep_explicit_bounds() {
        assert_eq!(
            days(Some(date(2026, 10, 1)), Some(date(2026, 10, 1)), TODAY).unwrap(),
            (date(2026, 10, 1), date(2026, 10, 1)),
        );
    }

    #[test]
    fn days_out_of_order_are_refused() {
        assert!(days(Some(date(2026, 9, 2)), Some(date(2026, 9, 1)), TODAY).is_err());
    }
}
