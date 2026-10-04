use anyhow::Result;
use jiff::civil::Date;
use serde::Serialize;
use serde_json::json;
use ureq::Agent;
use uuid::Uuid;

use crate::{http, npm::Package};

const EVENT: &str = "npm_package_downloads";

/// Events per request, well under the batch endpoint's 20 MB limit.
const BATCH_SIZE: usize = 1000;

#[derive(Debug, Serialize)]
pub struct Event {
    event: &'static str,
    distinct_id: String,
    uuid: Uuid,
    timestamp: String,
    properties: Properties,
}

#[derive(Debug, Serialize)]
struct Properties {
    package: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    repository: Option<String>,
    downloads: u64,
    #[serde(rename = "$process_person_profile")]
    process_person_profile: bool,
}

impl Event {
    pub fn new(package: &Package, day: Date, downloads: u64) -> Self {
        // PostHog merges events that agree on `uuid`, `event`, `distinct_id`
        // and `timestamp`, the last one ingested winning. Deriving all four
        // from the package and day lets a re-run replace a count rather than
        // add to it, so none of them may change for a count already sent.
        let point = format!(
            "https://api.npmjs.org/downloads/point/{day}/{}",
            package.name
        );

        Self {
            event: EVENT,
            distinct_id: package.name.clone(),
            uuid: Uuid::new_v5(&Uuid::NAMESPACE_URL, point.as_bytes()),
            timestamp: format!("{day}T00:00:00Z"),
            properties: Properties {
                package: package.name.clone(),
                repository: package.repository.clone(),
                downloads,
                process_person_profile: false,
            },
        }
    }
}

/// Send events through the batch endpoint.
///
/// `historical` routes them through the pipeline PostHog keeps for imports,
/// which spares a backfill the rate limit live events see per distinct ID.
pub fn capture(
    agent: &Agent,
    host: &str,
    token: &str,
    events: &[Event],
    historical: bool,
) -> Result<()> {
    let url = format!("{}/batch/", host.trim_end_matches('/'));

    for batch in events.chunks(BATCH_SIZE) {
        let body = json!({
            "api_key": token,
            "historical_migration": historical,
            "batch": batch,
        });

        http::check(http::call(|| agent.post(&url).send_json(&body))?)?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use jiff::civil::date;

    use super::*;

    fn package(repository: Option<&str>) -> Package {
        Package {
            name: "@langri-sha/projen".to_owned(),
            repository: repository.map(str::to_owned),
        }
    }

    #[test]
    fn event() {
        let package = package(Some("https://github.com/langri-sha/projen"));

        assert_eq!(
            serde_json::to_value(Event::new(&package, date(2026, 10, 1), 42)).unwrap(),
            json!({
                "event": "npm_package_downloads",
                "distinct_id": "@langri-sha/projen",
                "uuid": "4d0600e9-d9fa-5236-b12f-2a4a1bdee5a0",
                "timestamp": "2026-10-01T00:00:00Z",
                "properties": {
                    "package": "@langri-sha/projen",
                    "repository": "https://github.com/langri-sha/projen",
                    "downloads": 42,
                    "$process_person_profile": false,
                },
            }),
        );
    }

    #[test]
    fn event_without_a_repository() {
        let event = serde_json::to_value(Event::new(&package(None), date(2026, 10, 1), 42));

        assert!(event.unwrap()["properties"].get("repository").is_none());
    }

    #[test]
    fn event_identity_survives_a_revised_count() {
        let (package, day) = (package(None), date(2026, 10, 1));

        assert_eq!(
            Event::new(&package, day, 42).uuid,
            Event::new(&package, day, 43).uuid,
        );
    }
}
