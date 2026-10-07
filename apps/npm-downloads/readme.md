# npm-downloads

Sends daily npm download counts to PostHog: one `npm_package_downloads` event
per package and day, for every package the `malkron` npm user maintains, with
`package`, `repository` and `downloads` properties.

Cloud Scheduler starts it daily as a Cloud Run job. It reports the day before
yesterday, because npm takes more than a day to count one. The _npm downloads_
dashboard in PostHog charts the results. Each run also sends an
`npm_downloads_published` event, and an alert fires when a day passes without
one.

`npm-downloads.yml` deploys the image on every push to `main`; the job is
defined in
[`terraform/modules/telemetry-job`](../../terraform/modules/telemetry-job/readme.md).

## Backfilling

Pass `--from` to send earlier days, on Cloud Run or locally. Locally,
`--dry-run` prints the events instead of sending them.

```shell
gcloud run jobs execute npm-downloads --project <edge> --region us-west1 --args=--from,2025-04-01
POSTHOG_PROJECT_TOKEN=phc_… cargo run -p npm-downloads -- --from 2025-04-01
```

Events are keyed by package and day, so sending a day again replaces its counts
rather than adding to them — once PostHog has merged the duplicates in the
background, which can take a while.
