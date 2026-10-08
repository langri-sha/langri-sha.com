# github-repositories

Sends daily GitHub repository traffic to PostHog: one
`github_repository_traffic` event per repository and day, for every public
repository `langri-sha` owns apart from forks, archived ones included, with
`repository`, `views`, `unique_visitors`, `clones` and `unique_cloners`
properties. Each run also sends a `github_repositories_run` event.

It reports the day before yesterday. GitHub counts each repository's traffic on
a schedule of its own, and hours into a day some repositories still lack the day
before.

## Running locally

Only those with push access to a repository see its traffic, so run it with the
owner's token:

```shell
GITHUB_TOKEN=$(gh auth token) cargo run -p github-repositories -- --dry-run
```

## Backfilling

GitHub keeps 14 days of traffic. `--from` sends the days since then that it
still holds, through PostHog's import pipeline, to load them or make up for days
the job missed. It stops at the day before the run's, which the daily run sends.

```shell
GITHUB_TOKEN=$(gh auth token) POSTHOG_PROJECT_TOKEN=phc_… cargo run -p github-repositories -- --from 2026-09-24
```

Events are keyed by repository and day, so sending a day again replaces its
counts rather than adding to them, once PostHog has merged the duplicates in the
background.
