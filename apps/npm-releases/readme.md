# npm-releases

Sends npm release activity to PostHog every hour:

- `npm_package_pending_changes` — for each package, the beachball change files
  waiting on its next release: how many, of which type, and the biggest bump.
- `npm_package_published` — each version npm published in the past hour, with
  its bump over the previous version and the time since the package's last
  publish.
- `npm_releases_run` — one per run, with what it asked of GitHub and npm.

It reads each repository's `change/` directory as the mal-the-kron GitHub App,
with credentials from the organization project's Secret Manager.

The _npm releases_ dashboard in PostHog shows what is waiting to be released and
the publishing history, and the _GitHub API usage_ dashboard tracks the job's
API cost and rate limit. Alerts fire when an hour passes without a run, when the
rate limit runs low, and when a query nears GitHub's 10-second limit.

`npm-releases.yml` deploys the image on every push to `main`, and can be run by
hand.

## Running locally

A token stands in for the App:

```shell
GITHUB_TOKEN=$(gh auth token) cargo run -p npm-releases -- --dry-run
```

## Backfilling

`--published-since` sends the versions published since then, through PostHog's
import pipeline, to load history or make up for hours the job missed. Start from
the first missed hour, since PostHog keeps duplicates. It stops at the hour
before the run's, which the hourly run sends.

```shell
POSTHOG_PROJECT_TOKEN=phc_… cargo run -p npm-releases -- --published-since 2016-11-11T00:00:00Z
```
