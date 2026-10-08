use std::time::Duration;

use jiff::{Timestamp, civil::Date};
use serde::Serialize;
use uuid::Uuid;

use crate::github::{Popular, Repository, Star, Traffic};

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

/// A repository's most popular referrers and paths, as GitHub ranks them on the
/// day of a run.
#[derive(Debug, Serialize)]
pub struct Referrers {
    event: &'static str,
    distinct_id: String,
    uuid: Uuid,
    timestamp: String,
    properties: ReferrersProperties,
}

#[derive(Debug, Serialize)]
struct ReferrersProperties {
    repository: String,
    #[serde(flatten)]
    popular: Popular,
    #[serde(rename = "$process_person_profile")]
    process_person_profile: bool,
}

impl Referrers {
    pub fn new(repository: &Repository, day: Date, popular: Popular) -> Self {
        // As with traffic, all four of PostHog's keys derive from the
        // repository and day, so that a re-run replaces the day's snapshot.
        let snapshot = format!("{}/graphs/traffic#referrers@{day}", repository.url);

        Self {
            event: "github_repository_referrers",
            distinct_id: repository.url.clone(),
            uuid: Uuid::new_v5(&Uuid::NAMESPACE_URL, snapshot.as_bytes()),
            timestamp: format!("{day}T00:00:00Z"),
            properties: ReferrersProperties {
                repository: repository.url.clone(),
                popular,
                process_person_profile: false,
            },
        }
    }
}

/// A star given to a repository, stamped when it was given.
#[derive(Debug, Serialize)]
pub struct Starred {
    event: &'static str,
    distinct_id: String,
    uuid: Uuid,
    timestamp: Timestamp,
    properties: StarredProperties,
}

#[derive(Debug, Serialize)]
struct StarredProperties {
    repository: String,
    stargazer: String,
    /// Whether the owner starred their own repository.
    #[serde(rename = "self")]
    own: bool,
    #[serde(rename = "$process_person_profile")]
    process_person_profile: bool,
}

impl Starred {
    pub fn new(repository: &Repository, star: Star, owner: &str) -> Self {
        // A star is the repository's and stargazer's, so sending it again
        // replaces it. The stargazer is known by their account rather than
        // their login, which they can change.
        let star_url = format!("{}/stargazers#{}", repository.url, star.stargazer_id);

        Self {
            event: "github_repository_starred",
            distinct_id: repository.url.clone(),
            uuid: Uuid::new_v5(&Uuid::NAMESPACE_URL, star_url.as_bytes()),
            timestamp: star.at,
            properties: StarredProperties {
                repository: repository.url.clone(),
                own: star.stargazer.eq_ignore_ascii_case(owner),
                stargazer: star.stargazer,
                process_person_profile: false,
            },
        }
    }
}

/// A record of a run. It carries no timestamp, so PostHog stamps it on
/// arrival, and a day without one is a day the job didn't run.
#[derive(Debug, Serialize)]
pub struct Run {
    event: &'static str,
    distinct_id: &'static str,
    properties: RunProperties,
}

#[derive(Debug, Serialize)]
struct RunProperties {
    day: Date,
    repositories: usize,
    events: usize,
    /// Whether the run read GitHub as the App or with someone's token.
    github_credential: &'static str,
    duration_ms: u128,
    #[serde(rename = "$process_person_profile")]
    process_person_profile: bool,
}

impl Run {
    pub fn new(
        day: Date,
        repositories: usize,
        events: usize,
        github_credential: &'static str,
        took: Duration,
    ) -> Self {
        Self {
            event: "github_repositories_run",
            distinct_id: "github-repositories",
            properties: RunProperties {
                day,
                repositories,
                events,
                github_credential,
                duration_ms: took.as_millis(),
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
    fn referrers() {
        let popular = Popular {
            referrers: serde_json::from_value(json!([
                { "referrer": "github.com", "count": 33, "uniques": 1 },
                { "referrer": "Google", "count": 1, "uniques": 1 },
            ]))
            .unwrap(),
            paths: serde_json::from_value(json!([
                { "path": "/langri-sha/npm_lazy", "title": "Overview", "count": 28, "uniques": 7 },
            ]))
            .unwrap(),
        };

        assert_eq!(
            serde_json::to_value(Referrers::new(&repository(), date(2026, 10, 8), popular))
                .unwrap(),
            json!({
                "event": "github_repository_referrers",
                "distinct_id": "https://github.com/langri-sha/npm_lazy",
                "uuid": Uuid::new_v5(
                    &Uuid::NAMESPACE_URL,
                    b"https://github.com/langri-sha/npm_lazy/graphs/traffic#referrers@2026-10-08",
                ),
                "timestamp": "2026-10-08T00:00:00Z",
                "properties": {
                    "repository": "https://github.com/langri-sha/npm_lazy",
                    "referrers": [
                        { "referrer": "github.com", "views": 33, "unique_visitors": 1 },
                        { "referrer": "Google", "views": 1, "unique_visitors": 1 },
                    ],
                    "paths": [
                        {
                            "path": "/langri-sha/npm_lazy",
                            "title": "Overview",
                            "views": 28,
                            "unique_visitors": 7,
                        },
                    ],
                    "$process_person_profile": false,
                },
            }),
        );
    }

    fn star(stargazer: &str, stargazer_id: u64, at: &str) -> Star {
        Star {
            stargazer: stargazer.to_owned(),
            stargazer_id,
            at: at.parse().unwrap(),
        }
    }

    #[test]
    fn starred() {
        assert_eq!(
            serde_json::to_value(Starred::new(
                &repository(),
                star("gaby", 835733, "2022-07-19T13:25:32Z"),
                "langri-sha",
            ))
            .unwrap(),
            json!({
                "event": "github_repository_starred",
                "distinct_id": "https://github.com/langri-sha/npm_lazy",
                "uuid": Uuid::new_v5(
                    &Uuid::NAMESPACE_URL,
                    b"https://github.com/langri-sha/npm_lazy/stargazers#835733",
                ),
                "timestamp": "2022-07-19T13:25:32Z",
                "properties": {
                    "repository": "https://github.com/langri-sha/npm_lazy",
                    "stargazer": "gaby",
                    "self": false,
                    "$process_person_profile": false,
                },
            }),
        );
    }

    #[test]
    fn own_stars_are_marked() {
        let event = serde_json::to_value(Starred::new(
            &repository(),
            star("Langri-sha", 77084, "2016-11-11T00:00:00Z"),
            "langri-sha",
        ))
        .unwrap();

        assert_eq!(event["properties"]["self"], true);
    }

    #[test]
    fn starred_identity_survives_starring_again() {
        assert_eq!(
            Starred::new(
                &repository(),
                star("gaby", 835733, "2022-07-19T13:25:32Z"),
                "langri-sha"
            )
            .uuid,
            Starred::new(
                &repository(),
                star("gaby", 835733, "2026-10-07T23:05:15Z"),
                "langri-sha"
            )
            .uuid,
        );
    }

    #[test]
    fn starred_identity_survives_a_new_login() {
        assert_eq!(
            Starred::new(
                &repository(),
                star("gaby", 835733, "2022-07-19T13:25:32Z"),
                "langri-sha"
            )
            .uuid,
            Starred::new(
                &repository(),
                star("gaby-renamed", 835733, "2022-07-19T13:25:32Z"),
                "langri-sha"
            )
            .uuid,
        );
    }

    #[test]
    fn run() {
        assert_eq!(
            serde_json::to_value(Run::new(
                date(2026, 10, 6),
                35,
                35,
                "app",
                Duration::from_millis(9876)
            ))
            .unwrap(),
            json!({
                "event": "github_repositories_run",
                "distinct_id": "github-repositories",
                "properties": {
                    "day": "2026-10-06",
                    "repositories": 35,
                    "events": 35,
                    "github_credential": "app",
                    "duration_ms": 9876,
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
