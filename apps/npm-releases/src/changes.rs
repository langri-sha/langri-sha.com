use std::collections::BTreeMap;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

use crate::github::Repository;

/// The kind of release a change asks for.
#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Bump {
    Major,
    Premajor,
    Minor,
    Preminor,
    Patch,
    Prepatch,
    Prerelease,
    None,
}

/// Pending changes to a package, counted by the bump each asks for.
#[derive(Debug, Default, PartialEq, Serialize)]
pub struct Counts {
    pub major: u32,
    pub premajor: u32,
    pub minor: u32,
    pub preminor: u32,
    pub patch: u32,
    pub prepatch: u32,
    pub prerelease: u32,
    pub none: u32,
}

impl Counts {
    fn add(&mut self, bump: Bump) {
        *match bump {
            Bump::Major => &mut self.major,
            Bump::Premajor => &mut self.premajor,
            Bump::Minor => &mut self.minor,
            Bump::Preminor => &mut self.preminor,
            Bump::Patch => &mut self.patch,
            Bump::Prepatch => &mut self.prepatch,
            Bump::Prerelease => &mut self.prerelease,
            Bump::None => &mut self.none,
        } += 1;
    }

    pub fn total(&self) -> u32 {
        self.major
            + self.premajor
            + self.minor
            + self.preminor
            + self.patch
            + self.prepatch
            + self.prerelease
            + self.none
    }

    /// The bump the next release takes: the biggest any change asks for, by
    /// beachball's ranking.
    pub fn bump(&self) -> Option<Bump> {
        [
            (Bump::Major, self.major),
            (Bump::Premajor, self.premajor),
            (Bump::Minor, self.minor),
            (Bump::Preminor, self.preminor),
            (Bump::Patch, self.patch),
            (Bump::Prepatch, self.prepatch),
            (Bump::Prerelease, self.prerelease),
            (Bump::None, self.none),
        ]
        .into_iter()
        .find(|&(_, count)| count > 0)
        .map(|(bump, _)| bump)
    }
}

/// A package's pending changes, and the repository they wait in.
#[derive(Debug, PartialEq)]
pub struct Pending {
    pub repository: String,
    pub counts: Counts,
}

/// Beachball writes a file per change, or one for all of them when
/// `groupChanges` is set.
#[derive(Deserialize)]
#[serde(untagged)]
enum ChangeFile {
    Grouped { changes: Vec<Change> },
    Single(Change),
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Change {
    package_name: String,
    #[serde(rename = "type")]
    bump: Bump,
}

/// Pending changes by package, across the repositories.
pub fn pending(repositories: &[Repository]) -> Result<BTreeMap<String, Pending>> {
    let mut pending = BTreeMap::<String, Pending>::new();

    for repository in repositories {
        for (name, text) in &repository.changes {
            let changes = match serde_json::from_str(text)
                .with_context(|| format!("{}: change/{name} isn't a change file", repository.url))?
            {
                ChangeFile::Grouped { changes } => changes,
                ChangeFile::Single(change) => vec![change],
            };

            for change in changes {
                pending
                    .entry(change.package_name)
                    .or_insert_with(|| Pending {
                        repository: repository.url.clone(),
                        counts: Counts::default(),
                    })
                    .counts
                    .add(change.bump);
            }
        }
    }

    Ok(pending)
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;

    fn repository(url: &str, changes: &[serde_json::Value]) -> Repository {
        Repository {
            url: url.to_owned(),
            changes: changes
                .iter()
                .enumerate()
                .map(|(i, change)| (format!("{i}.json"), change.to_string()))
                .collect(),
        }
    }

    fn change(package: &str, bump: &str) -> serde_json::Value {
        json!({
            "type": bump,
            "comment": "Update dependency pnpm to v12.9.0",
            "packageName": package,
            "email": "email not defined",
            "dependentChangeType": "patch",
        })
    }

    #[test]
    fn counts_changes_by_package() {
        let pending = pending(&[
            repository(
                "https://github.com/langri-sha/vitest",
                &[
                    change("@langri-sha/vitest", "patch"),
                    change("@langri-sha/vitest", "minor"),
                    change("@langri-sha/vitest", "preminor"),
                ],
            ),
            repository(
                "https://github.com/langri-sha/projen",
                &[json!({
                    "changes": [
                        change("@langri-sha/projen-project", "patch"),
                        change("@langri-sha/projen-uv", "none"),
                    ],
                })],
            ),
        ])
        .unwrap();

        assert_eq!(
            pending,
            BTreeMap::from([
                (
                    "@langri-sha/projen-project".to_owned(),
                    Pending {
                        repository: "https://github.com/langri-sha/projen".to_owned(),
                        counts: Counts {
                            patch: 1,
                            ..Counts::default()
                        },
                    }
                ),
                (
                    "@langri-sha/projen-uv".to_owned(),
                    Pending {
                        repository: "https://github.com/langri-sha/projen".to_owned(),
                        counts: Counts {
                            none: 1,
                            ..Counts::default()
                        },
                    }
                ),
                (
                    "@langri-sha/vitest".to_owned(),
                    Pending {
                        repository: "https://github.com/langri-sha/vitest".to_owned(),
                        counts: Counts {
                            minor: 1,
                            preminor: 1,
                            patch: 1,
                            ..Counts::default()
                        },
                    }
                ),
            ]),
        );
    }

    #[test]
    fn the_biggest_bump_wins() {
        let ranked = [
            Bump::None,
            Bump::Prerelease,
            Bump::Prepatch,
            Bump::Patch,
            Bump::Preminor,
            Bump::Minor,
            Bump::Premajor,
            Bump::Major,
        ];

        assert_eq!(Counts::default().bump(), None);

        for (i, &bump) in ranked.iter().enumerate() {
            let mut counts = Counts::default();
            ranked[..=i].iter().for_each(|&lesser| counts.add(lesser));

            assert_eq!(counts.bump(), Some(bump));
            assert_eq!(counts.total(), i as u32 + 1);
        }
    }

    #[test]
    fn refuses_what_isnt_a_change_file() {
        assert!(
            pending(&[repository(
                "https://github.com/langri-sha/vitest",
                &[json!({ "name": "vitest" })]
            )])
            .is_err()
        );
    }
}
