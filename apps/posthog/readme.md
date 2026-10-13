# posthog

Serves PostHog analytics from `https://langri-sha.com/psthg/`, so analytics are
requests to the site's own domain rather than to `posthog.com`.

The site is a static export with no server of its own to hold the proxy PostHog
recommends, so it runs here instead: an nginx image on Cloud Run, behind the
same load balancer as the site.

## Routing

| Request                | Upstream                                        |
| ---------------------- | ----------------------------------------------- |
| `/psthg/static/:path*` | `https://eu-assets.i.posthog.com/static/:path*` |
| `/psthg/array/:path*`  | `https://eu-assets.i.posthog.com/array/:path*`  |
| `/psthg/:path*`        | `https://eu.i.posthog.com/:path*`               |

Anything outside `/psthg/` answers 404, so it never works as an open proxy. Only
PostHog's EU origins are configured; nothing here can reach the US region.

## Safeguards

- Cookies are stripped from requests, and `Set-Cookie` from responses.
- The access log keeps the method, path, status and size — never query strings
  or visitor addresses.
- API responses are never cached; the SDK files are cached at Google's edge.
- Upstream certificates are verified, since what comes back is JavaScript that
  runs on the site. An upstream that fails verification answers 502.
- The service only takes traffic from the load balancer, so its own `run.app`
  URL should not answer.

## Configuration

| Variable                 | Default                   |                                                                            |
| ------------------------ | ------------------------- | -------------------------------------------------------------------------- |
| `PORT`                   | `8080`                    | Injected by Cloud Run.                                                     |
| `POSTHOG_ASSETS_HOST`    | `eu-assets.i.posthog.com` | Origin for the SDK bundles and remote config.                              |
| `POSTHOG_INGESTION_HOST` | `eu.i.posthog.com`        | Origin for capture, feature flags and the API.                             |
| `RESOLVER`               | `169.254.169.254`         | DNS for the per-request upstream lookup. The metadata server on Cloud Run. |

The proxy holds no credentials. The project token is public by design and ships
in the site's JavaScript.

## Project token

The token and the project ID are public, and no secret holds them.
`terraform/web` sets them as the `POSTHOG_PROJECT_TOKEN` and
`POSTHOG_PROJECT_ID` Actions variables from the `posthog_project.web` resource,
and the site build and CI read the variables.

The `posthog-project-id` secret serves `terraform/web` alone: its `import {}`
reads it to find the project. Write it without a trailing newline:

```sh
printf %s "$project_id" | gcloud secrets versions add posthog-project-id --data-file=-
```

## Development

```sh
docker compose up --build --force-recreate posthog
curl -i http://localhost:9003/psthg/static/array.js
```

This talks to the real PostHog, so it serves the actual SDK.
`docker compose run --rm --entrypoint nginx posthog -T` prints the rendered
config.
