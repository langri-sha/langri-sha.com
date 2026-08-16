# posthog-proxy

The first-party analytics endpoint. One Cloud Run service running the nginx
image in `apps/posthog`, which forwards `/psthg/*` to PostHog EU Cloud, and the
backend service the load balancer routes that path to.

It egresses straight to the internet rather than over the VPC: the upstream is
PostHog, not a service of ours. What it does not accept is traffic that has not
come through the load balancer, so the `run.app` URL is not a way around the
first-party path or the hosts it is published on.

Terraform owns the shape of the service. CI owns what runs on it.
