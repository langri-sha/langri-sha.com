use std::{
    cell::Cell,
    time::{Duration, Instant},
};

use anyhow::{Context, Result, bail};
use jiff::Timestamp;
use serde::Deserialize;
use serde_json::{Value, json};
use telemetry::http;
use ureq::Agent;

const ENDPOINT: &str = "https://api.github.com/graphql";

/// Repositories per query. Each query reads every change file of the
/// repositories it covers, so pages stay small enough to finish well within
/// the 10 seconds GitHub allows a query.
const PAGE_SIZE: usize = 50;

const QUERY: &str = r#"
query ($owner: String!, $first: Int!, $after: String) {
  repositoryOwner(login: $owner) {
    repositories(
      first: $first
      after: $after
      ownerAffiliations: OWNER
      isFork: false
      isArchived: false
      orderBy: { field: NAME, direction: ASC }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        url
        defaultBranchRef {
          target {
            ... on Commit {
              file(path: "change") {
                object {
                  ... on Tree {
                    entries {
                      name
                      object {
                        ... on Blob {
                          text
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  rateLimit {
    cost
    limit
    used
    remaining
    resetAt
  }
}
"#;

/// A repository, with the change files on its default branch.
#[derive(Debug, PartialEq)]
pub struct Repository {
    pub url: String,
    /// The contents of each change file, by file name.
    pub changes: Vec<(String, String)>,
}

/// What reading the repositories took: the queries, what GitHub charged for
/// them, and the rate limit as the last one left it.
#[derive(Debug, Default, PartialEq)]
pub struct Usage {
    pub queries: u32,
    pub cost: u64,
    pub took: Duration,
    /// The longest any one query took, which GitHub cuts off at 10 seconds.
    pub slowest: Duration,
    pub limit: u64,
    pub used: u64,
    pub remaining: u64,
    pub resets: Option<Timestamp>,
}

impl Usage {
    fn record(&mut self, took: Duration, rate_limit: RateLimit) {
        self.queries += 1;
        self.cost += rate_limit.cost;
        self.took += took;
        self.slowest = self.slowest.max(took);
        self.limit = rate_limit.limit;
        self.used = rate_limit.used;
        self.remaining = rate_limit.remaining;
        self.resets = Some(rate_limit.reset_at);
    }
}

/// The owner's repositories, apart from forks, archives and empty ones.
pub fn repositories(agent: &Agent, token: &str, owner: &str) -> Result<(Vec<Repository>, Usage)> {
    let authorization = format!("Bearer {token}");
    let mut repositories = Vec::new();
    let mut usage = Usage::default();
    let mut after = None;

    loop {
        let body = json!({
            "query": QUERY,
            "variables": { "owner": owner, "first": PAGE_SIZE, "after": after },
        });
        // Timed per attempt, so that backing off from a throttled one doesn't
        // read as a slow query.
        let took = Cell::new(Duration::ZERO);
        let response = http::call(|| {
            let started = Instant::now();
            let response = agent
                .post(ENDPOINT)
                .header("Authorization", &authorization)
                .send_json(&body);

            took.set(started.elapsed());

            response
        })?;
        let page = page(http::json(response)?)?;

        usage.record(took.get(), page.rate_limit);
        repositories.extend(page.repositories);

        if !page.has_next_page {
            break;
        }

        after = Some(
            page.end_cursor
                .context("GitHub left out where the next page starts")?,
        );
    }

    Ok((repositories, usage))
}

#[derive(Debug, Deserialize)]
struct Response {
    data: Option<Data>,
    #[serde(default)]
    errors: Vec<Error>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Data {
    repository_owner: Option<Owner>,
    rate_limit: RateLimit,
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
struct RateLimit {
    cost: u64,
    limit: u64,
    used: u64,
    remaining: u64,
    reset_at: Timestamp,
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
    url: String,
    default_branch_ref: Option<Branch>,
}

#[derive(Debug, Deserialize)]
struct Branch {
    target: Target,
}

#[derive(Debug, Deserialize)]
struct Target {
    #[serde(default)]
    file: Option<File>,
}

#[derive(Debug, Deserialize)]
struct File {
    object: Option<Tree>,
}

#[derive(Debug, Deserialize)]
struct Tree {
    #[serde(default)]
    entries: Vec<Entry>,
}

#[derive(Debug, Deserialize)]
struct Entry {
    name: String,
    object: Option<Blob>,
}

#[derive(Debug, Deserialize)]
struct Blob {
    #[serde(default)]
    text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct Error {
    #[serde(rename = "type")]
    kind: Option<String>,
    #[serde(default)]
    path: Vec<Value>,
    message: String,
}

impl Error {
    /// GitHub reports a repository without a `change/` directory as an error
    /// beside the data, rather than leaving the file out.
    fn is_missing_change_directory(&self) -> bool {
        self.kind.as_deref() == Some("NOT_FOUND") && self.path.last() == Some(&json!("file"))
    }
}

#[derive(Debug, PartialEq)]
struct Page {
    repositories: Vec<Repository>,
    has_next_page: bool,
    end_cursor: Option<String>,
    rate_limit: RateLimit,
}

fn page(response: Response) -> Result<Page> {
    if let Some(error) = response
        .errors
        .iter()
        .find(|error| !error.is_missing_change_directory())
    {
        bail!("GitHub turned down the query: {}", error.message);
    }

    let data = response.data.context("GitHub answered without data")?;
    let owner = data
        .repository_owner
        .context("GitHub knows no such owner")?;

    let repositories = owner
        .repositories
        .nodes
        .into_iter()
        .filter_map(|node| repository(node).transpose())
        .collect::<Result<_>>()?;

    Ok(Page {
        repositories,
        has_next_page: owner.repositories.page_info.has_next_page,
        end_cursor: owner.repositories.page_info.end_cursor,
        rate_limit: data.rate_limit,
    })
}

/// A repository with its change files, or none for an empty one, which has no
/// default branch to read them from.
fn repository(node: Node) -> Result<Option<Repository>> {
    let Some(branch) = node.default_branch_ref else {
        return Ok(None);
    };

    let entries = branch
        .target
        .file
        .and_then(|file| file.object)
        .map(|tree| tree.entries)
        .unwrap_or_default();

    let changes = entries
        .into_iter()
        .filter(|entry| entry.name.ends_with(".json"))
        .map(|entry| {
            let text = entry
                .object
                .and_then(|blob| blob.text)
                .with_context(|| format!("{}: change/{} isn't text", node.url, entry.name))?;

            Ok((entry.name, text))
        })
        .collect::<Result<_>>()?;

    Ok(Some(Repository {
        url: node.url,
        changes,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn response(nodes: Value, errors: Value) -> Response {
        serde_json::from_value(json!({
            "data": {
                "repositoryOwner": {
                    "repositories": {
                        "pageInfo": { "hasNextPage": false, "endCursor": "Y3Vyc29y" },
                        "nodes": nodes,
                    },
                },
                "rateLimit": rate_limit(),
            },
            "errors": errors,
        }))
        .unwrap()
    }

    fn rate_limit() -> Value {
        json!({
            "cost": 1,
            "limit": 5000,
            "used": 178,
            "remaining": 4822,
            "resetAt": "2026-10-06T15:51:20Z",
        })
    }

    fn missing_change_directory(node: usize) -> Value {
        json!({
            "type": "NOT_FOUND",
            "path": ["repositoryOwner", "repositories", "nodes", node, "defaultBranchRef", "target", "file"],
            "message": "Could not resolve file for path 'change'.",
        })
    }

    fn with_changes(url: &str, entries: Value) -> Value {
        json!({
            "url": url,
            "defaultBranchRef": { "target": { "file": { "object": { "entries": entries } } } },
        })
    }

    #[test]
    fn reads_change_files() {
        let page = page(response(
            json!([
                with_changes("https://github.com/langri-sha/vitest", json!([
                    { "name": "@langri-sha-vitest-1.json", "object": { "text": "{}" } },
                    { "name": "readme.md", "object": { "text": "Notes" } },
                ])),
                { "url": "https://github.com/langri-sha/dotfiles", "defaultBranchRef": { "target": { "file": null } } },
            ]),
            json!([missing_change_directory(1)]),
        ))
        .unwrap();

        assert_eq!(
            page,
            Page {
                repositories: vec![
                    Repository {
                        url: "https://github.com/langri-sha/vitest".to_owned(),
                        changes: vec![("@langri-sha-vitest-1.json".to_owned(), "{}".to_owned())],
                    },
                    Repository {
                        url: "https://github.com/langri-sha/dotfiles".to_owned(),
                        changes: vec![],
                    },
                ],
                has_next_page: false,
                end_cursor: Some("Y3Vyc29y".to_owned()),
                rate_limit: serde_json::from_value(rate_limit()).unwrap(),
            },
        );
    }

    #[test]
    fn usage_adds_up_across_queries() {
        let mut usage = Usage::default();
        let mut second = serde_json::from_value::<RateLimit>(rate_limit()).unwrap();
        second.used += 1;
        second.remaining -= 1;

        usage.record(
            Duration::from_millis(3500),
            serde_json::from_value(rate_limit()).unwrap(),
        );
        usage.record(Duration::from_millis(1200), second);

        assert_eq!(
            usage,
            Usage {
                queries: 2,
                cost: 2,
                took: Duration::from_millis(4700),
                slowest: Duration::from_millis(3500),
                limit: 5000,
                used: 179,
                remaining: 4821,
                resets: Some("2026-10-06T15:51:20Z".parse().unwrap()),
            },
        );
    }

    #[test]
    fn skips_empty_repositories() {
        let page = page(response(
            json!([{ "url": "https://github.com/langri-sha/json-schema-sort", "defaultBranchRef": null }]),
            json!([]),
        ))
        .unwrap();

        assert!(page.repositories.is_empty());
    }

    #[test]
    fn refuses_other_errors() {
        let mut elsewhere = missing_change_directory(0);
        elsewhere["path"] = json!(["repositoryOwner"]);

        for error in [
            elsewhere,
            json!({ "type": "RATE_LIMITED", "path": [], "message": "API rate limit exceeded" }),
            json!({ "message": "Something went wrong" }),
        ] {
            assert!(page(response(json!([]), json!([error]))).is_err());
        }
    }

    #[test]
    fn refuses_change_files_without_text() {
        let response = response(
            json!([with_changes(
                "https://github.com/langri-sha/vitest",
                json!([
                    { "name": "@langri-sha-vitest-1.json", "object": { "text": null } },
                ])
            )]),
            json!([]),
        );

        assert!(page(response).is_err());
    }
}
