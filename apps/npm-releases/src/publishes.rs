use jiff::Timestamp;
use semver::Version;
use serde::Serialize;

use crate::changes::Bump;

/// A version of a package, and when npm published it.
#[derive(Clone, Debug, PartialEq)]
pub struct Publish {
    pub version: Version,
    pub at: Timestamp,
}

/// A publish, the package's publish before it, and the bump it made.
#[derive(Debug, PartialEq)]
pub struct Release<'a> {
    pub publish: &'a Publish,
    pub previous: Option<&'a Publish>,
    pub kind: Kind,
    /// The highest version published before it that it exceeds.
    pub bumped_from: Option<&'a Version>,
}

/// What a publish released.
#[derive(Clone, Copy, Debug, PartialEq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    /// The package's first version, or one below every version before it.
    Initial,
    #[serde(untagged)]
    Bump(Bump),
}

/// The publishes from `from` up to `to`, out of a package's history, oldest
/// first.
pub fn between(history: &[Publish], from: Timestamp, to: Timestamp) -> Vec<Release<'_>> {
    history
        .iter()
        .enumerate()
        .filter(|(_, publish)| from <= publish.at && publish.at < to)
        .map(|(i, publish)| {
            let bumped_from = history[..i]
                .iter()
                .map(|earlier| &earlier.version)
                .filter(|&version| version < &publish.version)
                .max();

            Release {
                publish,
                previous: i.checked_sub(1).map(|i| &history[i]),
                kind: bumped_from.map_or(Kind::Initial, |from| {
                    Kind::Bump(bump(from, &publish.version))
                }),
                bumped_from,
            }
        })
        .collect()
}

/// The bump from one version to a higher one, by node-semver's `diff`, whose
/// names beachball's change types share.
fn bump(from: &Version, to: &Version) -> Bump {
    let main = |version: &Version| (version.major, version.minor, version.patch);

    // Releasing a prerelease completes the bump it previewed.
    if !from.pre.is_empty() && to.pre.is_empty() {
        if from.minor == 0 && from.patch == 0 {
            return Bump::Major;
        }

        if main(from) == main(to) {
            return if from.patch == 0 {
                Bump::Minor
            } else {
                Bump::Patch
            };
        }
    }

    let pre = !to.pre.is_empty();

    if from.major != to.major {
        if pre { Bump::Premajor } else { Bump::Major }
    } else if from.minor != to.minor {
        if pre { Bump::Preminor } else { Bump::Minor }
    } else if from.patch != to.patch {
        if pre { Bump::Prepatch } else { Bump::Patch }
    } else {
        Bump::Prerelease
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn publish(version: &str, at: &str) -> Publish {
        Publish {
            version: version.parse().unwrap(),
            at: at.parse().unwrap(),
        }
    }

    #[test]
    fn releases_between_two_times() {
        let history = [
            publish("1.0.0", "2026-10-06T13:15:00Z"),
            publish("1.0.1", "2026-10-06T14:00:00Z"),
            publish("1.1.0", "2026-10-06T14:59:59.999Z"),
            publish("1.1.1", "2026-10-06T15:00:00Z"),
        ];

        assert_eq!(
            between(
                &history,
                "2026-10-06T14:00:00Z".parse().unwrap(),
                "2026-10-06T15:00:00Z".parse().unwrap(),
            ),
            [
                Release {
                    publish: &history[1],
                    previous: Some(&history[0]),
                    kind: Kind::Bump(Bump::Patch),
                    bumped_from: Some(&history[0].version),
                },
                Release {
                    publish: &history[2],
                    previous: Some(&history[1]),
                    kind: Kind::Bump(Bump::Minor),
                    bumped_from: Some(&history[1].version),
                },
            ],
        );
    }

    #[test]
    fn backports_bump_the_version_they_follow() {
        let history = [
            publish("1.0.0", "2026-10-01T00:00:00Z"),
            publish("2.0.0", "2026-10-02T00:00:00Z"),
            publish("1.0.1", "2026-10-03T00:00:00Z"),
        ];
        let releases = between(
            &history,
            "2026-10-03T00:00:00Z".parse().unwrap(),
            "2026-10-04T00:00:00Z".parse().unwrap(),
        );

        assert_eq!(releases[0].previous, Some(&history[1]));
        assert_eq!(releases[0].bumped_from, Some(&history[0].version));
        assert_eq!(releases[0].kind, Kind::Bump(Bump::Patch));
    }

    #[test]
    fn bumps() {
        for (from, to, bump) in [
            ("1.2.3", "2.0.0", Bump::Major),
            ("1.2.3", "1.3.0", Bump::Minor),
            ("1.2.3", "1.2.4", Bump::Patch),
            ("1.2.3", "2.0.0-beta.0", Bump::Premajor),
            ("1.2.3", "1.3.0-beta.0", Bump::Preminor),
            ("1.2.3", "1.2.4-beta.0", Bump::Prepatch),
            ("2.0.0-beta.0", "2.0.0-beta.1", Bump::Prerelease),
            ("1.0.0-alpha", "1.0.0-alpha-1", Bump::Prerelease),
            ("1.0.0-beta.2", "1.0.0", Bump::Major),
            ("1.0.0-1", "1.1.1", Bump::Major),
            ("1.1.0-beta.0", "1.1.0", Bump::Minor),
            ("1.1.1-beta.0", "1.1.1", Bump::Patch),
            ("1.1.0-beta.0", "1.2.0", Bump::Minor),
        ] {
            assert_eq!(
                super::bump(&from.parse().unwrap(), &to.parse().unwrap()),
                bump,
                "{from} to {to}",
            );
        }
    }

    #[test]
    fn first_release_has_none_before_it() {
        let history = [publish("0.1.0", "2026-10-06T14:30:00Z")];

        assert_eq!(
            between(
                &history,
                "2026-10-06T14:00:00Z".parse().unwrap(),
                "2026-10-06T15:00:00Z".parse().unwrap(),
            ),
            [Release {
                publish: &history[0],
                previous: None,
                kind: Kind::Initial,
                bumped_from: None,
            }],
        );
    }
}
