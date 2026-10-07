use jiff::Timestamp;
use semver::Version;

/// A version of a package, and when npm published it.
#[derive(Clone, Debug, PartialEq)]
pub struct Publish {
    pub version: Version,
    pub at: Timestamp,
}

/// A publish, and the package's publish before it.
#[derive(Debug, PartialEq)]
pub struct Release<'a> {
    pub publish: &'a Publish,
    pub previous: Option<&'a Publish>,
}

/// The publishes from `from` up to `to`, out of a package's history, oldest
/// first.
pub fn between(history: &[Publish], from: Timestamp, to: Timestamp) -> Vec<Release<'_>> {
    history
        .iter()
        .enumerate()
        .filter(|(_, publish)| from <= publish.at && publish.at < to)
        .map(|(i, publish)| Release {
            publish,
            previous: i.checked_sub(1).map(|i| &history[i]),
        })
        .collect()
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
                },
                Release {
                    publish: &history[2],
                    previous: Some(&history[1]),
                },
            ],
        );
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
            }],
        );
    }
}
