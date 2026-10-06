# telemetry-job

A scheduled job that publishes to PostHog, such as `npm-downloads`. One Cloud
Run job running the job's image, and the Cloud Scheduler job that runs it.

It publishes with the PostHog project token in its environment: the public write
key, which the site ships to every browser too. Cloud Scheduler calls the Cloud
Run Admin API as an account of its own, which may run this job and nothing else.

Secrets it needs beyond the token come from Secret Manager into its environment,
and its account may read each of those and no others. Access can take a minute
to reach Cloud Run, so the first run after it's granted may fail on it.

Terraform owns the shape of the job. CI owns what runs in it.
