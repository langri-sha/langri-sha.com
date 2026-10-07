use std::collections::BTreeMap;

use anyhow::{Context, Result};
use serde::{Deserialize, de::IgnoredAny};
use serde_json::Value;
use telemetry::http;
use ureq::Agent;

use crate::publishes::Publish;

#[derive(Deserialize)]
struct Packument {
    #[serde(default)]
    versions: BTreeMap<String, IgnoredAny>,
    /// Publish times by version, beside `created`, `modified` and, once a
    /// package is unpublished, an object saying so.
    #[serde(default)]
    time: BTreeMap<String, Value>,
}

/// The versions of a package npm serves, oldest first.
///
/// Publish times come only with the full packument: the abbreviated one npm
/// serves installs leaves them out.
pub fn history(agent: &Agent, package: &str) -> Result<Vec<Publish>> {
    let url = format!("https://registry.npmjs.org/{package}");
    let packument = http::json(http::call(|| agent.get(&url).call())?)?;

    publishes(package, packument)
}

fn publishes(package: &str, packument: Packument) -> Result<Vec<Publish>> {
    let mut publishes = packument
        .versions
        .into_keys()
        .map(|version| {
            let at = packument
                .time
                .get(&version)
                .and_then(Value::as_str)
                .with_context(|| format!("npm has no publish time for {package}@{version}"))?;

            Ok(Publish {
                at: at
                    .parse()
                    .with_context(|| format!("{package}@{version} was published at {at}"))?,
                version: version
                    .parse()
                    .with_context(|| format!("{package} has version {version}"))?,
            })
        })
        .collect::<Result<Vec<_>>>()?;

    publishes.sort_by_key(|publish| publish.at);

    Ok(publishes)
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;

    fn packument(value: Value) -> Packument {
        serde_json::from_value(value).unwrap()
    }

    #[test]
    fn publishes_in_the_order_npm_took_them() {
        let publishes = publishes(
            "@langri-sha/vitest",
            packument(json!({
                "versions": {
                    "1.10.0": { "name": "@langri-sha/vitest" },
                    "1.9.0": {},
                    "2.0.0-beta.0": {},
                },
                "time": {
                    "created": "2024-07-08T21:40:59.054Z",
                    "modified": "2026-10-02T20:06:29.968Z",
                    "1.9.0": "2024-07-08T21:40:59.054Z",
                    "1.10.0": "2025-01-02T03:04:05.678Z",
                    "2.0.0-beta.0": "2026-10-02T20:06:29.968Z",
                    "1.9.1": "2024-07-09T00:00:00.000Z",
                },
            })),
        )
        .unwrap();

        assert_eq!(
            publishes,
            [
                Publish {
                    version: "1.9.0".parse().unwrap(),
                    at: "2024-07-08T21:40:59.054Z".parse().unwrap(),
                },
                Publish {
                    version: "1.10.0".parse().unwrap(),
                    at: "2025-01-02T03:04:05.678Z".parse().unwrap(),
                },
                Publish {
                    version: "2.0.0-beta.0".parse().unwrap(),
                    at: "2026-10-02T20:06:29.968Z".parse().unwrap(),
                },
            ],
        );
    }

    #[test]
    fn versions_without_a_publish_time_are_refused() {
        assert!(
            publishes(
                "@langri-sha/vitest",
                packument(json!({ "versions": { "1.0.0": {} }, "time": {} })),
            )
            .is_err()
        );
    }
}
