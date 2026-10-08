use std::{thread, time::Duration};

use anyhow::Result;
use jiff::{ToSpan, civil::Date};
use serde::Deserialize;
use telemetry::http;
use ureq::{Agent, http::StatusCode};

/// The spacing between download counts asked for. A burst of a few dozen
/// trips the Cloudflare rate limit in front of the API, which then turns the
/// client away for a while.
const PACE: Duration = Duration::from_secs(1);

/// Downloads of a package on each day from `from` to `to`, or none at all if
/// npm has not heard of it.
///
/// Bulk queries leave out scoped packages, so this takes a request per
/// package and year.
pub fn daily_downloads(
    agent: &Agent,
    package: &str,
    from: Date,
    to: Date,
) -> Result<Vec<(Date, u64)>> {
    #[derive(Deserialize)]
    struct Range {
        downloads: Vec<Day>,
    }

    #[derive(Deserialize)]
    struct Day {
        day: Date,
        downloads: u64,
    }

    let mut days = Vec::new();

    for (start, end) in windows(from, to)? {
        thread::sleep(PACE);

        let url = format!("https://api.npmjs.org/downloads/range/{start}:{end}/{package}");
        let response = http::call(|| agent.get(&url).call())?;

        if response.status() == StatusCode::NOT_FOUND {
            continue;
        }

        let range: Range = http::json(response)?;

        days.extend(
            range
                .downloads
                .into_iter()
                .map(|day| (day.day, day.downloads)),
        );
    }

    Ok(days)
}

/// Whether npm has counted `day` in a package's daily downloads. npm reports
/// zero for days it has yet to count rather than leaving them out, so only a
/// download shows that it has.
pub fn has_counted(downloads: &[(Date, u64)], day: Date) -> bool {
    downloads.iter().any(|&(d, n)| d == day && n > 0)
}

fn windows(from: Date, to: Date) -> Result<Vec<(Date, Date)>> {
    let mut windows = Vec::new();
    let mut start = from;

    while start <= to {
        let end = to.min(start.checked_add(364.days())?);

        windows.push((start, end));
        start = end.tomorrow()?;
    }

    Ok(windows)
}

#[cfg(test)]
mod tests {
    use jiff::civil::date;

    use super::*;

    #[test]
    fn windows_cover_each_day_once() {
        assert_eq!(
            windows(date(2025, 1, 1), date(2026, 3, 1)).unwrap(),
            [
                (date(2025, 1, 1), date(2025, 12, 31)),
                (date(2026, 1, 1), date(2026, 3, 1)),
            ],
        );
        assert_eq!(
            windows(date(2026, 10, 1), date(2026, 10, 1)).unwrap(),
            [(date(2026, 10, 1), date(2026, 10, 1))],
        );
    }

    #[test]
    fn has_counted_a_day_with_downloads() {
        let downloads = [(date(2026, 10, 4), 341), (date(2026, 10, 5), 203)];

        assert!(has_counted(&downloads, date(2026, 10, 5)));
    }

    #[test]
    fn has_not_counted_a_day_without_downloads() {
        let downloads = [(date(2026, 10, 5), 203), (date(2026, 10, 6), 0)];

        assert!(!has_counted(&downloads, date(2026, 10, 6)));
        assert!(!has_counted(&downloads, date(2026, 10, 7)));
    }
}
