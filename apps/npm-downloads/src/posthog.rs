use jiff::civil::Date;
use serde::Serialize;
use telemetry::npm::Package;
use uuid::Uuid;

const EVENT: &str = "npm_package_downloads";

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

/// A record of a publishing run. It carries no timestamp, so PostHog stamps it
/// on arrival, and a day without one is a day the job didn't publish.
#[derive(Debug, Serialize)]
pub struct Run {
    event: &'static str,
    distinct_id: &'static str,
    properties: RunProperties,
}

#[derive(Debug, Serialize)]
struct RunProperties {
    from: Date,
    to: Date,
    events: usize,
    #[serde(rename = "$process_person_profile")]
    process_person_profile: bool,
}

impl Run {
    pub fn new(from: Date, to: Date, events: usize) -> Self {
        Self {
            event: "npm_downloads_published",
            distinct_id: "npm-downloads",
            properties: RunProperties {
                from,
                to,
                events,
                process_person_profile: false,
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use jiff::civil::date;
    use serde_json::json;

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
    fn run() {
        assert_eq!(
            serde_json::to_value(Run::new(date(2026, 9, 5), date(2026, 10, 1), 891)).unwrap(),
            json!({
                "event": "npm_downloads_published",
                "distinct_id": "npm-downloads",
                "properties": {
                    "from": "2026-09-05",
                    "to": "2026-10-01",
                    "events": 891,
                    "$process_person_profile": false,
                },
            }),
        );
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
