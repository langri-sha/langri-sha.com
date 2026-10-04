use std::{thread, time::Duration};

use anyhow::Result;
use jiff::{ToSpan, civil::Date};
use serde::Deserialize;
use ureq::{Agent, http::StatusCode};

use crate::http;

/// The spacing between download counts asked for. A burst of a few dozen
/// trips the Cloudflare rate limit in front of the API, which then turns the
/// client away for a while.
const PACE: Duration = Duration::from_secs(1);

/// The last day npm has counted downloads for.
pub fn last_counted_day(agent: &Agent) -> Result<Date> {
    #[derive(Deserialize)]
    struct Point {
        end: Date,
    }

    let response = http::call(|| {
        agent
            .get("https://api.npmjs.org/downloads/point/last-day")
            .call()
    })?;

    Ok(http::json::<Point>(response)?.end)
}

pub struct Package {
    pub name: String,
    /// Where the source lives, as a web address.
    pub repository: Option<String>,
}

/// The packages a user maintains, by name.
pub fn maintained_packages(agent: &Agent, maintainer: &str) -> Result<Vec<Package>> {
    #[derive(Deserialize)]
    struct Page {
        objects: Vec<Object>,
        total: usize,
    }

    #[derive(Deserialize)]
    struct Object {
        package: Listing,
    }

    #[derive(Deserialize)]
    struct Listing {
        name: String,
        #[serde(default)]
        links: Links,
    }

    #[derive(Default, Deserialize)]
    struct Links {
        repository: Option<String>,
    }

    let text = format!("maintainer:{maintainer}");
    let mut packages = Vec::new();

    loop {
        let from = packages.len().to_string();
        let response = http::call(|| {
            agent
                .get("https://registry.npmjs.org/-/v1/search")
                .query("text", &text)
                .query("size", "250")
                .query("from", &from)
                .call()
        })?;
        let page: Page = http::json(response)?;

        if page.objects.is_empty() {
            break;
        }

        packages.extend(page.objects.into_iter().map(|Object { package }| Package {
            name: package.name,
            repository: package.links.repository.as_deref().map(web_address),
        }));

        if packages.len() >= page.total {
            break;
        }
    }

    packages.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(packages)
}

/// The web address of a repository, from the `repository` URL npm keeps for
/// it, e.g. `git+https://github.com/langri-sha/projen.git`.
fn web_address(url: &str) -> String {
    let url = url.strip_prefix("git+").unwrap_or(url);
    let url = url.strip_suffix(".git").unwrap_or(url);

    for scheme in ["ssh://git@", "git://"] {
        if let Some(rest) = url.strip_prefix(scheme) {
            return format!("https://{rest}");
        }
    }

    url.to_owned()
}

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
    fn web_addresses() {
        for url in [
            "git+https://github.com/langri-sha/projen.git",
            "git+ssh://git@github.com/langri-sha/projen.git",
            "git://github.com/langri-sha/projen.git",
            "https://github.com/langri-sha/projen",
        ] {
            assert_eq!(web_address(url), "https://github.com/langri-sha/projen");
        }
    }

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
}
