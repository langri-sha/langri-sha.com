use std::collections::BTreeMap;

use anyhow::{Context, Result, bail};
use jiff::{Timestamp, civil::Date, tz::TimeZone};
use serde::{Deserialize, Serialize, de::DeserializeOwned};
use serde_json::json;
use telemetry::http;
use ureq::Agent;

const ENDPOINT: &str = "https://api.github.com/graphql";

/// Nodes per query, the most GitHub serves.
const PAGE_SIZE: usize = 100;

const QUERY: &str = r#"
query ($owner: String!, $first: Int!, $after: String) {
  repositoryOwner(login: $owner) {
    repositories(
      first: $first
      after: $after
      ownerAffiliations: OWNER
      privacy: PUBLIC
      isFork: false
      orderBy: { field: NAME, direction: ASC }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        nameWithOwner
        url
      }
    }
  }
}
"#;

const STARGAZERS: &str = r#"
query ($owner: String!, $name: String!, $first: Int!, $after: String) {
  repository(owner: $owner, name: $name) {
    stargazers(
      first: $first
      after: $after
      orderBy: { field: STARRED_AT, direction: DESC }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        starredAt
        node {
          login
          databaseId
        }
      }
    }
  }
}
"#;

#[derive(Debug, PartialEq)]
pub struct Repository {
    /// The owner and name, as `langri-sha/projen`.
    pub name: String,
    pub url: String,
}

/// The owner's public repositories, archived ones included, apart from forks.
pub fn repositories(agent: &Agent, token: &str, owner: &str) -> Result<Vec<Repository>> {
    let authorization = format!("Bearer {token}");
    let mut repositories = Vec::new();
    let mut after = None;

    loop {
        let body = json!({
            "query": QUERY,
            "variables": { "owner": owner, "first": PAGE_SIZE, "after": after },
        });
        let response = http::call(|| {
            agent
                .post(ENDPOINT)
                .header("Authorization", &authorization)
                .send_json(&body)
        })?;
        let page = page(http::json(response)?)?;

        repositories.extend(page.repositories);

        if !page.has_next_page {
            break;
        }

        after = Some(
            page.end_cursor
                .context("GitHub left out where the next page starts")?,
        );
    }

    Ok(repositories)
}

#[derive(Debug, PartialEq)]
pub struct Star {
    pub stargazer: String,
    /// The stargazer's account, which keeps its ID through a change of login.
    pub stargazer_id: u64,
    pub at: Timestamp,
}

/// The stars given to a repository since `since`, newest first.
pub fn stars(agent: &Agent, token: &str, repository: &str, since: Timestamp) -> Result<Vec<Star>> {
    let (owner, name) = repository
        .split_once('/')
        .with_context(|| format!("{repository} isn't an owner and name"))?;
    let authorization = format!("Bearer {token}");
    let mut stars = Vec::new();
    let mut after = None;

    loop {
        let body = json!({
            "query": STARGAZERS,
            "variables": { "owner": owner, "name": name, "first": PAGE_SIZE, "after": after },
        });
        let response = http::call(|| {
            agent
                .post(ENDPOINT)
                .header("Authorization", &authorization)
                .send_json(&body)
        })?;
        let page = stargazers(http::json(response)?)?;
        // GitHub lists the newest stars first, so the pages after one that
        // reaches past `since` only hold older stars.
        let reached = page.stars.iter().any(|star| star.at < since);

        stars.extend(page.stars.into_iter().filter(|star| star.at >= since));

        if reached || !page.has_next_page {
            break;
        }

        after = Some(
            page.end_cursor
                .context("GitHub left out where the next page starts")?,
        );
    }

    Ok(stars)
}

/// A day's traffic to a repository, from UTC midnight.
#[derive(Debug, Default, PartialEq, Serialize)]
pub struct Traffic {
    pub views: u64,
    pub unique_visitors: u64,
    pub clones: u64,
    pub unique_cloners: u64,
}

/// A repository's traffic on each day from `from` to `to`, as far back as
/// GitHub keeps it, which is 14 days.
pub fn traffic(
    agent: &Agent,
    token: &str,
    repository: &str,
    from: Date,
    to: Date,
) -> Result<BTreeMap<Date, Traffic>> {
    #[derive(Deserialize)]
    struct Views {
        views: Vec<Count>,
    }

    #[derive(Deserialize)]
    struct Clones {
        clones: Vec<Count>,
    }

    let url = format!("https://api.github.com/repos/{repository}/traffic");
    let Views { views } = get(agent, token, &format!("{url}/views"))?;
    let Clones { clones } = get(agent, token, &format!("{url}/clones"))?;

    between(repository, days(views, clones), from, to)
}

fn get<T: DeserializeOwned>(agent: &Agent, token: &str, url: &str) -> Result<T> {
    let authorization = format!("Bearer {token}");

    http::json(http::call(|| {
        agent
            .get(url)
            .header("Accept", "application/vnd.github+json")
            .header("Authorization", &authorization)
            .call()
    })?)
}

/// What GitHub counted on a day, which starts at UTC midnight.
#[derive(Debug, Deserialize)]
struct Count {
    timestamp: Timestamp,
    count: u64,
    uniques: u64,
}

/// Views and clones by day, on the days GitHub has counted both for.
///
/// GitHub lists the days without traffic too, but counts each repository on a
/// schedule of its own, so a day can be missing for some repositories hours
/// after it ended. A day only one list has is one GitHub has yet to count, or
/// has stopped keeping, for the other.
fn days(views: Vec<Count>, clones: Vec<Count>) -> BTreeMap<Date, Traffic> {
    let clones: BTreeMap<Date, Count> = clones
        .into_iter()
        .map(|clone| (date(clone.timestamp), clone))
        .collect();

    views
        .into_iter()
        .filter_map(|view| {
            let day = date(view.timestamp);
            let clone = clones.get(&day)?;

            Some((
                day,
                Traffic {
                    views: view.count,
                    unique_visitors: view.uniques,
                    clones: clone.count,
                    unique_cloners: clone.uniques,
                },
            ))
        })
        .collect()
}

fn date(timestamp: Timestamp) -> Date {
    timestamp.to_zoned(TimeZone::UTC).date()
}

/// The days from `from` to `to`, refusing any GitHub has yet to count rather
/// than sending it as a day without traffic.
fn between(
    repository: &str,
    mut days: BTreeMap<Date, Traffic>,
    from: Date,
    to: Date,
) -> Result<BTreeMap<Date, Traffic>> {
    if let Some((&counted, _)) = days.last_key_value()
        && counted < to
    {
        bail!("GitHub has counted traffic to {repository} up to {counted}, not {to} yet");
    }

    days.retain(|day, _| (from..=to).contains(day));

    Ok(days)
}

/// A repository's most popular referrers and paths: the 10 of each with the
/// most views over the 14 days GitHub keeps.
#[derive(Debug, PartialEq, Serialize)]
pub struct Popular {
    pub referrers: Vec<Referrer>,
    pub paths: Vec<Path>,
}

#[derive(Debug, Deserialize, PartialEq, Serialize)]
pub struct Referrer {
    referrer: String,
    #[serde(rename(deserialize = "count"))]
    views: u64,
    #[serde(rename(deserialize = "uniques"))]
    unique_visitors: u64,
}

#[derive(Debug, Deserialize, PartialEq, Serialize)]
pub struct Path {
    path: String,
    title: String,
    #[serde(rename(deserialize = "count"))]
    views: u64,
    #[serde(rename(deserialize = "uniques"))]
    unique_visitors: u64,
}

pub fn popular(agent: &Agent, token: &str, repository: &str) -> Result<Popular> {
    let url = format!("https://api.github.com/repos/{repository}/traffic/popular");

    Ok(Popular {
        referrers: get(agent, token, &format!("{url}/referrers"))?,
        paths: get(agent, token, &format!("{url}/paths"))?,
    })
}

#[derive(Debug, Deserialize)]
struct Response<T> {
    data: Option<T>,
    #[serde(default)]
    errors: Vec<Error>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Data {
    repository_owner: Option<Owner>,
}

#[derive(Debug, Deserialize)]
struct Owner {
    repositories: Connection,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Connection {
    page_info: PageInfo,
    nodes: Vec<Node>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PageInfo {
    has_next_page: bool,
    end_cursor: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Node {
    name_with_owner: String,
    url: String,
}

#[derive(Debug, Deserialize)]
struct Stargazed {
    repository: Option<Stargazers>,
}

#[derive(Debug, Deserialize)]
struct Stargazers {
    stargazers: StarConnection,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct StarConnection {
    page_info: PageInfo,
    edges: Vec<StarEdge>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct StarEdge {
    starred_at: Timestamp,
    node: User,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct User {
    login: String,
    database_id: u64,
}

#[derive(Debug, Deserialize)]
struct Error {
    message: String,
}

#[derive(Debug, PartialEq)]
struct Page {
    repositories: Vec<Repository>,
    has_next_page: bool,
    end_cursor: Option<String>,
}

/// What a query answered, refusing it when GitHub reports errors beside it.
fn data<T>(response: Response<T>) -> Result<T> {
    if let Some(error) = response.errors.first() {
        bail!("GitHub turned down the query: {}", error.message);
    }

    response.data.context("GitHub answered without data")
}

fn page(response: Response<Data>) -> Result<Page> {
    let owner = data(response)?
        .repository_owner
        .context("GitHub knows no such owner")?;

    let repositories = owner
        .repositories
        .nodes
        .into_iter()
        .map(|node| Repository {
            name: node.name_with_owner,
            url: node.url,
        })
        .collect();

    Ok(Page {
        repositories,
        has_next_page: owner.repositories.page_info.has_next_page,
        end_cursor: owner.repositories.page_info.end_cursor,
    })
}

#[derive(Debug, PartialEq)]
struct StarsPage {
    stars: Vec<Star>,
    has_next_page: bool,
    end_cursor: Option<String>,
}

fn stargazers(response: Response<Stargazed>) -> Result<StarsPage> {
    let connection = data(response)?
        .repository
        .context("GitHub knows no such repository")?
        .stargazers;

    let stars = connection
        .edges
        .into_iter()
        .map(|edge| Star {
            stargazer: edge.node.login,
            stargazer_id: edge.node.database_id,
            at: edge.starred_at,
        })
        .collect();

    Ok(StarsPage {
        stars,
        has_next_page: connection.page_info.has_next_page,
        end_cursor: connection.page_info.end_cursor,
    })
}

#[cfg(test)]
mod tests {
    use jiff::civil::date;

    use super::*;

    fn counts(days: &[(&str, u64, u64)]) -> Vec<Count> {
        days.iter()
            .map(|&(day, count, uniques)| Count {
                timestamp: format!("{day}T00:00:00Z").parse().unwrap(),
                count,
                uniques,
            })
            .collect()
    }

    fn traffic(views: u64, unique_visitors: u64, clones: u64, unique_cloners: u64) -> Traffic {
        Traffic {
            views,
            unique_visitors,
            clones,
            unique_cloners,
        }
    }

    #[test]
    fn reads_repositories() {
        let response: Response<Data> = serde_json::from_value(json!({
            "data": {
                "repositoryOwner": {
                    "repositories": {
                        "pageInfo": { "hasNextPage": true, "endCursor": "Y3Vyc29y" },
                        "nodes": [
                            { "nameWithOwner": "langri-sha/ajax-limited", "url": "https://github.com/langri-sha/ajax-limited" },
                            { "nameWithOwner": "langri-sha/projen", "url": "https://github.com/langri-sha/projen" },
                        ],
                    },
                },
            },
        }))
        .unwrap();

        assert_eq!(
            page(response).unwrap(),
            Page {
                repositories: vec![
                    Repository {
                        name: "langri-sha/ajax-limited".to_owned(),
                        url: "https://github.com/langri-sha/ajax-limited".to_owned(),
                    },
                    Repository {
                        name: "langri-sha/projen".to_owned(),
                        url: "https://github.com/langri-sha/projen".to_owned(),
                    },
                ],
                has_next_page: true,
                end_cursor: Some("Y3Vyc29y".to_owned()),
            },
        );
    }

    #[test]
    fn reads_stargazers() {
        let response: Response<Stargazed> = serde_json::from_value(json!({
            "data": {
                "repository": {
                    "stargazers": {
                        "pageInfo": { "hasNextPage": false, "endCursor": "Y3Vyc29y" },
                        "edges": [
                            {
                                "starredAt": "2022-07-19T13:25:32Z",
                                "node": { "login": "gaby", "databaseId": 835733 },
                            },
                            {
                                "starredAt": "2021-12-16T11:38:35Z",
                                "node": { "login": "xldeveloper", "databaseId": 362862 },
                            },
                        ],
                    },
                },
            },
        }))
        .unwrap();

        assert_eq!(
            stargazers(response).unwrap(),
            StarsPage {
                stars: vec![
                    Star {
                        stargazer: "gaby".to_owned(),
                        stargazer_id: 835733,
                        at: "2022-07-19T13:25:32Z".parse().unwrap(),
                    },
                    Star {
                        stargazer: "xldeveloper".to_owned(),
                        stargazer_id: 362862,
                        at: "2021-12-16T11:38:35Z".parse().unwrap(),
                    },
                ],
                has_next_page: false,
                end_cursor: Some("Y3Vyc29y".to_owned()),
            },
        );
    }

    #[test]
    fn refuses_unknown_repositories() {
        let response = json!({ "data": { "repository": null } });

        assert!(stargazers(serde_json::from_value(response).unwrap()).is_err());
    }

    #[test]
    fn refuses_errors() {
        for response in [
            json!({ "data": null, "errors": [{ "message": "Something went wrong" }] }),
            json!({ "data": { "repositoryOwner": null } }),
            json!({}),
        ] {
            assert!(page(serde_json::from_value(response).unwrap()).is_err());
        }
    }

    #[test]
    fn days_join_views_and_clones() {
        let days = days(
            counts(&[("2026-10-05", 5, 3), ("2026-10-06", 35, 4)]),
            counts(&[("2026-10-05", 0, 0), ("2026-10-06", 12, 2)]),
        );

        assert_eq!(
            days,
            BTreeMap::from([
                (date(2026, 10, 5), traffic(5, 3, 0, 0)),
                (date(2026, 10, 6), traffic(35, 4, 12, 2)),
            ]),
        );
    }

    #[test]
    fn days_end_where_views_or_clones_do() {
        let days = days(
            counts(&[("2026-10-05", 5, 3), ("2026-10-06", 35, 4)]),
            counts(&[("2026-10-05", 1, 1)]),
        );

        assert_eq!(
            days,
            BTreeMap::from([(date(2026, 10, 5), traffic(5, 3, 1, 1))])
        );
    }

    #[test]
    fn days_start_where_views_or_clones_do() {
        let days = days(
            counts(&[("2026-10-05", 5, 3), ("2026-10-06", 35, 4)]),
            counts(&[("2026-10-04", 2, 2), ("2026-10-05", 1, 1)]),
        );

        assert_eq!(
            days,
            BTreeMap::from([(date(2026, 10, 5), traffic(5, 3, 1, 1))])
        );
    }

    #[test]
    fn days_of_a_repository_without_counts() {
        assert!(days(vec![], vec![]).is_empty());
    }

    #[test]
    fn between_picks_the_days_asked_for() {
        let days = BTreeMap::from([
            (date(2026, 10, 4), traffic(0, 0, 3, 2)),
            (date(2026, 10, 5), traffic(5, 3, 0, 0)),
            (date(2026, 10, 6), traffic(35, 4, 12, 2)),
            (date(2026, 10, 7), traffic(15, 3, 1, 1)),
        ]);

        assert_eq!(
            between(
                "langri-sha/projen",
                days,
                date(2026, 10, 5),
                date(2026, 10, 6)
            )
            .unwrap(),
            BTreeMap::from([
                (date(2026, 10, 5), traffic(5, 3, 0, 0)),
                (date(2026, 10, 6), traffic(35, 4, 12, 2)),
            ]),
        );
    }

    #[test]
    fn between_refuses_days_github_has_yet_to_count() {
        let days = BTreeMap::from([(date(2026, 10, 6), traffic(35, 4, 12, 2))]);

        assert!(
            between(
                "langri-sha/projen",
                days,
                date(2026, 10, 7),
                date(2026, 10, 7)
            )
            .is_err()
        );
    }

    #[test]
    fn between_without_counts_is_empty() {
        assert!(
            between(
                "langri-sha/projen",
                BTreeMap::new(),
                date(2026, 10, 6),
                date(2026, 10, 6),
            )
            .unwrap()
            .is_empty()
        );
    }
}
