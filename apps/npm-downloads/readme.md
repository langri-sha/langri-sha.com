# npm-downloads

Sends daily npm download counts to PostHog: one `npm_package_downloads` event
per package and day, for every package the `malkron` npm user maintains, with
`package`, `repository` and `downloads` properties.

Cloud Scheduler starts it daily as a Cloud Run job. Each run reports the last
seven days, ending yesterday in UTC. npm takes days to count a day, and reports
zero for the ones it has yet to count, so a run sends those days with whatever
npm has by then and the next runs send them again until they are final. The _npm
downloads_ dashboard in PostHog charts the results, taking the highest count per
package and day, which makes sending a day again harmless. Each run also sends
an `npm_downloads_published` event, and an alert fires when a day passes without
one.

`npm-downloads.yml` deploys the image on every push to `main`; the job is
defined in
[`terraform/modules/telemetry-job`](../../terraform/modules/telemetry-job/readme.md).

## Backfilling

Pass `--from` to send earlier days, on Cloud Run or locally; `--to` is optional
and defaults to yesterday. Without `--from`, `--to` ends the trailing window of
seven days. Locally, `--dry-run` prints the events instead of sending them.

```shell
gcloud run jobs execute npm-downloads --project <edge> --region us-west1 --args=--from,2025-04-01
POSTHOG_PROJECT_TOKEN=phc_… cargo run -p npm-downloads -- --from 2025-04-01
```

Events are keyed by package and day, so sending a day again replaces its counts
rather than adding to them — once PostHog has merged the duplicates in the
background, which can take a while. The dashboard does not wait for that, as it
takes the highest count.
