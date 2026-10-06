# telemetry-job

A scheduled job that publishes to PostHog, such as `npm-downloads`. One Cloud
Run job running the job's image, and the Cloud Scheduler job that runs it.

It publishes with the PostHog project token in its environment: the public write
key, which the site ships to every browser too. Cloud Scheduler calls the Cloud
Run Admin API as an account of its own, which may run this job and nothing else.

Terraform owns the shape of the job. CI owns what runs in it.
