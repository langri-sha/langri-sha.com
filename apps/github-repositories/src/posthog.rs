use jiff::civil::Date;
use serde::Serialize;
use uuid::Uuid;

use crate::github::{Repository, Traffic};

const EVENT: &str = "github_repository_traffic";

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
    repository: String,
    #[serde(flatten)]
    traffic: Traffic,
    #[serde(rename = "$process_person_profile")]
    process_person_profile: bool,
}

impl Event {
    pub fn new(repository: &Repository, day: Date, traffic: Traffic) -> Self {
        // PostHog merges events that agree on `uuid`, `event`, `distinct_id`
        // and `timestamp`, the last one ingested winning. Deriving all four
        // from the repository and day lets a re-run replace a day's traffic
        // rather than add to it, so none of them may change for a day already
        // sent.
        let graph = format!("{}/graphs/traffic#{day}", repository.url);

        Self {
            event: EVENT,
            distinct_id: repository.url.clone(),
            uuid: Uuid::new_v5(&Uuid::NAMESPACE_URL, graph.as_bytes()),
            timestamp: format!("{day}T00:00:00Z"),
            properties: Properties {
                repository: repository.url.clone(),
                traffic,
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

    fn repository() -> Repository {
        Repository {
            name: "langri-sha/npm_lazy".to_owned(),
            url: "https://github.com/langri-sha/npm_lazy".to_owned(),
        }
    }

    #[test]
    fn event() {
        let traffic = Traffic {
            views: 8,
            unique_visitors: 3,
            clones: 1,
            unique_cloners: 1,
        };

        assert_eq!(
            serde_json::to_value(Event::new(&repository(), date(2026, 10, 7), traffic)).unwrap(),
            json!({
                "event": "github_repository_traffic",
                "distinct_id": "https://github.com/langri-sha/npm_lazy",
                "uuid": Uuid::new_v5(
                    &Uuid::NAMESPACE_URL,
                    b"https://github.com/langri-sha/npm_lazy/graphs/traffic#2026-10-07",
                ),
                "timestamp": "2026-10-07T00:00:00Z",
                "properties": {
                    "repository": "https://github.com/langri-sha/npm_lazy",
                    "views": 8,
                    "unique_visitors": 3,
                    "clones": 1,
                    "unique_cloners": 1,
                    "$process_person_profile": false,
                },
            }),
        );
    }

    #[test]
    fn event_identity_survives_revised_traffic() {
        let day = date(2026, 10, 7);
        let revised = Traffic {
            views: 1,
            ..Traffic::default()
        };

        assert_eq!(
            Event::new(&repository(), day, Traffic::default()).uuid,
            Event::new(&repository(), day, revised).uuid,
        );
    }
}
