# npm-downloads

The daily job that publishes npm package downloads to PostHog. One Cloud Run job
running the image of `apps/npm-downloads`, and the Cloud Scheduler job that runs
it.

It reads the PostHog project token from Secret Manager into its environment, so
the token never passes through the job's configuration. Cloud Scheduler calls
the Cloud Run Admin API as an account of its own, which may run this job and
nothing else.

Terraform owns the shape of the job. CI owns what runs in it.
