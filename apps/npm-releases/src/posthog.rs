use std::{collections::BTreeMap, time::Duration};

use jiff::Timestamp;
use serde::Serialize;
use telemetry::npm::Package;
use uuid::Uuid;

use crate::{
    changes::{Bump, Counts, Pending},
    github::Usage,
};

const EVENT: &str = "npm_package_pending_changes";

#[derive(Debug, Serialize)]
pub struct Event {
    event: &'static str,
    distinct_id: String,
    uuid: Uuid,
    timestamp: Timestamp,
    properties: Properties,
}

#[derive(Debug, Serialize)]
struct Properties {
    package: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    repository: Option<String>,
    pending_changes: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    bump: Option<Bump>,
    #[serde(flatten)]
    counts: Counts,
    #[serde(rename = "$process_person_profile")]
    process_person_profile: bool,
}

impl Event {
    pub fn new(package: &str, repository: Option<String>, counts: Counts, hour: Timestamp) -> Self {
        // PostHog merges events that agree on `uuid`, `event`, `distinct_id`
        // and `timestamp`, the last one ingested winning. Deriving all four
        // from the package and hour lets a re-run within the hour replace its
        // snapshot rather than add to it.
        let snapshot = format!("https://www.npmjs.com/package/{package}#pending-changes@{hour}");

        Self {
            event: EVENT,
            distinct_id: package.to_owned(),
            uuid: Uuid::new_v5(&Uuid::NAMESPACE_URL, snapshot.as_bytes()),
            timestamp: hour,
            properties: Properties {
                package: package.to_owned(),
                repository,
                pending_changes: counts.total(),
                bump: counts.bump(),
                counts,
                process_person_profile: false,
            },
        }
    }
}

/// An event for every package the maintainer publishes, pending changes or
/// not, so that a release shows as its changes clearing, and for any package
/// with changes waiting that npm doesn't list yet.
pub fn snapshot(
    packages: &[Package],
    mut pending: BTreeMap<String, Pending>,
    hour: Timestamp,
) -> Vec<Event> {
    let mut events: Vec<_> = packages
        .iter()
        .map(|package| match pending.remove(&package.name) {
            Some(Pending { repository, counts }) => {
                Event::new(&package.name, Some(repository), counts, hour)
            }
            None => Event::new(
                &package.name,
                package.repository.clone(),
                Counts::default(),
                hour,
            ),
        })
        .collect();

    events.extend(
        pending
            .into_iter()
            .map(|(package, Pending { repository, counts })| {
                Event::new(&package, Some(repository), counts, hour)
            }),
    );

    events
}

/// A record of a run and of what it asked of GitHub and npm. It carries no
/// timestamp, so PostHog stamps it on arrival, and an hour without one is an
/// hour the job didn't run.
#[derive(Debug, Serialize)]
pub struct Run {
    event: &'static str,
    distinct_id: &'static str,
    properties: RunProperties,
}

#[derive(Debug, Serialize)]
struct RunProperties {
    hour: Timestamp,
    repositories: usize,
    packages: usize,
    github_queries: u32,
    github_query_cost: u64,
    github_query_ms: u128,
    github_slowest_query_ms: u128,
    github_rate_limit: u64,
    github_rate_limit_used: u64,
    github_rate_limit_remaining: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    github_rate_limit_resets: Option<Timestamp>,
    npm_requests: u32,
    npm_ms: u128,
    duration_ms: u128,
    #[serde(rename = "$process_person_profile")]
    process_person_profile: bool,
}

/// Requests made of npm, and the time they took.
#[derive(Debug)]
pub struct Requests {
    pub count: u32,
    pub took: Duration,
}

impl Run {
    pub fn new(
        hour: Timestamp,
        repositories: usize,
        packages: usize,
        github: &Usage,
        npm: &Requests,
        took: Duration,
    ) -> Self {
        Self {
            event: "npm_releases_run",
            distinct_id: "npm-releases",
            properties: RunProperties {
                hour,
                repositories,
                packages,
                github_queries: github.queries,
                github_query_cost: github.cost,
                github_query_ms: github.took.as_millis(),
                github_slowest_query_ms: github.slowest.as_millis(),
                github_rate_limit: github.limit,
                github_rate_limit_used: github.used,
                github_rate_limit_remaining: github.remaining,
                github_rate_limit_resets: github.resets,
                npm_requests: npm.count,
                npm_ms: npm.took.as_millis(),
                duration_ms: took.as_millis(),
                process_person_profile: false,
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;

    const HOUR: &str = "2026-10-06T15:00:00Z";

    fn hour() -> Timestamp {
        HOUR.parse().unwrap()
    }

    fn package(name: &str, repository: Option<&str>) -> Package {
        Package {
            name: name.to_owned(),
            repository: repository.map(str::to_owned),
        }
    }

    fn pending(repository: &str, counts: Counts) -> Pending {
        Pending {
            repository: repository.to_owned(),
            counts,
        }
    }

    #[test]
    fn event() {
        let counts = Counts {
            minor: 1,
            patch: 2,
            ..Counts::default()
        };
        let repository = Some("https://github.com/langri-sha/vitest".to_owned());

        assert_eq!(
            serde_json::to_value(Event::new("@langri-sha/vitest", repository, counts, hour()))
                .unwrap(),
            json!({
                "event": "npm_package_pending_changes",
                "distinct_id": "@langri-sha/vitest",
                "uuid": "cd6fda18-d98a-5415-b19c-82c03141fa3d",
                "timestamp": HOUR,
                "properties": {
                    "package": "@langri-sha/vitest",
                    "repository": "https://github.com/langri-sha/vitest",
                    "pending_changes": 3,
                    "bump": "minor",
                    "major": 0,
                    "premajor": 0,
                    "preminor": 0,
                    "prepatch": 0,
                    "minor": 1,
                    "patch": 2,
                    "prerelease": 0,
                    "none": 0,
                    "$process_person_profile": false,
                },
            }),
        );
    }

    #[test]
    fn run() {
        let github = Usage {
            queries: 1,
            cost: 1,
            took: Duration::from_millis(3512),
            slowest: Duration::from_millis(3512),
            limit: 5000,
            used: 178,
            remaining: 4822,
            resets: Some("2026-10-06T15:51:20Z".parse().unwrap()),
        };
        let npm = Requests {
            count: 1,
            took: Duration::from_millis(640),
        };

        assert_eq!(
            serde_json::to_value(Run::new(
                hour(),
                45,
                34,
                &github,
                &npm,
                Duration::from_millis(4321)
            ))
            .unwrap(),
            json!({
                "event": "npm_releases_run",
                "distinct_id": "npm-releases",
                "properties": {
                    "hour": HOUR,
                    "repositories": 45,
                    "packages": 34,
                    "github_queries": 1,
                    "github_query_cost": 1,
                    "github_query_ms": 3512,
                    "github_slowest_query_ms": 3512,
                    "github_rate_limit": 5000,
                    "github_rate_limit_used": 178,
                    "github_rate_limit_remaining": 4822,
                    "github_rate_limit_resets": "2026-10-06T15:51:20Z",
                    "npm_requests": 1,
                    "npm_ms": 640,
                    "duration_ms": 4321,
                    "$process_person_profile": false,
                },
            }),
        );
    }

    #[test]
    fn event_without_pending_changes() {
        let event = serde_json::to_value(Event::new(
            "@langri-sha/vitest",
            None,
            Counts::default(),
            hour(),
        ))
        .unwrap();

        assert_eq!(event["properties"]["pending_changes"], 0);
        assert!(event["properties"].get("bump").is_none());
        assert!(event["properties"].get("repository").is_none());
    }

    #[test]
    fn event_identity_survives_revised_counts() {
        let patch = Counts {
            patch: 1,
            ..Counts::default()
        };

        assert_eq!(
            Event::new("@langri-sha/vitest", None, patch, hour()).uuid,
            Event::new("@langri-sha/vitest", None, Counts::default(), hour()).uuid,
        );
    }

    #[test]
    fn snapshot_covers_published_and_unpublished_packages() {
        let events = snapshot(
            &[
                package(
                    "@langri-sha/prettier",
                    Some("https://github.com/langri-sha/prettier"),
                ),
                package(
                    "@langri-sha/vitest",
                    Some("https://github.com/langri-sha/old-vitest"),
                ),
            ],
            BTreeMap::from([
                (
                    "@langri-sha/projen-new".to_owned(),
                    pending(
                        "https://github.com/langri-sha/projen",
                        Counts {
                            minor: 1,
                            ..Counts::default()
                        },
                    ),
                ),
                (
                    "@langri-sha/vitest".to_owned(),
                    pending(
                        "https://github.com/langri-sha/vitest",
                        Counts {
                            patch: 1,
                            ..Counts::default()
                        },
                    ),
                ),
            ]),
            hour(),
        );

        let summary: Vec<_> = events
            .iter()
            .map(|event| {
                let properties = &serde_json::to_value(event).unwrap()["properties"];

                (
                    properties["package"].clone(),
                    properties["repository"].clone(),
                    properties["pending_changes"].clone(),
                )
            })
            .collect();

        assert_eq!(
            summary,
            [
                (
                    json!("@langri-sha/prettier"),
                    json!("https://github.com/langri-sha/prettier"),
                    json!(0),
                ),
                (
                    json!("@langri-sha/vitest"),
                    json!("https://github.com/langri-sha/vitest"),
                    json!(1),
                ),
                (
                    json!("@langri-sha/projen-new"),
                    json!("https://github.com/langri-sha/projen"),
                    json!(1),
                ),
            ],
        );
    }
}
