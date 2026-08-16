# posthog

Serves PostHog EU Cloud from `https://langri-sha.com/psthg/`. An nginx image
that strips the prefix and forwards to the PostHog origin that answers for the
path, so analytics are first-party requests to our own domain instead of
third-party requests to `posthog.com`.

The site is a static export on Cloud Storage, so there is no Next.js runtime to
hold the `rewrites()` rule PostHog documents. This is that rule, as a Cloud Run
service on the same load balancer, reached through the `/psthg` path rules of
the production and preview hosts and nothing else.

## Routing

| Request                | Upstream                                        |
| ---------------------- | ----------------------------------------------- |
| `/psthg/static/:path*` | `https://eu-assets.i.posthog.com/static/:path*` |
| `/psthg/array/:path*`  | `https://eu-assets.i.posthog.com/array/:path*`  |
| `/psthg/:path*`        | `https://eu.i.posthog.com/:path*`               |

`/static/` carries the SDK bundles and `/array/` the remote configuration, both
from the assets origin; event capture, feature flags and the rest of the API are
answered by the ingestion origin. Methods, request bodies, query strings and
status codes pass through untouched, and `Host` follows the upstream, which is
how PostHog tells the two apart.

`/psthg` redirects to `/psthg/`, because the load balancer routes the bare path
here rather than leaving it on a backend bucket. Anything outside the prefix is
a 404: the URL map sends nothing else here, and a request that arrives by some
other route must not find an open proxy.

The US origins, `us.i.posthog.com` and `us-assets.i.posthog.com`, are what
PostHog's documentation shows by default. They appear nowhere in this image, and
there is no fallback that could reach them.

Upstream certificates are verified against the image's trust store, which nginx
does not do on its own. What comes back is JavaScript that runs on the site's
own origin, so an upstream the proxy cannot authenticate answers 502 rather than
being trusted anyway. CI proves it both ways: a stub whose certificate is in the
trust store is proxied, and the same stub without it is refused.

## What does not pass through

- **Cookies.** Being same-origin, the browser attaches the site's cookies to
  every analytics request. PostHog identifies events from the request payload,
  so they are stripped on the way out, and `Set-Cookie` is dropped on the way
  back.
- **Caching of API responses.** Ingestion, feature flag and API responses are
  answered `Cache-Control: no-store`. Cloud CDN is off on the backend service,
  so nothing is cached at the edge either. The assets keep the caching PostHog
  advertises for them.
- **Query strings, into the log.** A capture request carries event data in its
  query string, and the visitor's address in `X-Forwarded-For`. The access log
  records the method, the path, the status and the size, and none of the rest.
  The error log has no format of its own and names the whole request line, so it
  is held to `crit`: an upstream failure shows up as a 502 in the access log
  instead.

Nothing here rewrites CORS headers, unlike the configurations PostHog documents:
those proxies sit on a subdomain of their own, and this one is same-origin with
the site.

## Configuration

| Variable                 | Default                   |                                                                            |
| ------------------------ | ------------------------- | -------------------------------------------------------------------------- |
| `PORT`                   | `8080`                    | Injected by Cloud Run.                                                     |
| `POSTHOG_ASSETS_HOST`    | `eu-assets.i.posthog.com` | Origin for the SDK bundles and remote config.                              |
| `POSTHOG_INGESTION_HOST` | `eu.i.posthog.com`        | Origin for capture, feature flags and the API.                             |
| `RESOLVER`               | `169.254.169.254`         | DNS for the per-request upstream lookup. The metadata server on Cloud Run. |

No PostHog credentials are involved. The project token is public by design and
lives in the browser bundle; the proxy is an unauthenticated pass-through and
holds nothing of its own.

## Development

```sh
docker compose up --build --force-recreate posthog
curl -i http://localhost:9003/psthg/static/array.js
```

The upstreams are the real ones, so this serves the actual SDK. To read the
rendered config rather than infer it:

```sh
docker compose run --rm --entrypoint nginx posthog -T
```

## Deploying

The pieces come up in this order, and the order matters: the site must not start
sending events before there is a revision to answer them.

1. `terraform apply` in `terraform/web` creates the Cloud Run service, the
   serverless network endpoint group, the backend service and the `/psthg` path
   rules on the production and preview hosts. The service is created with
   Google's `hello` placeholder image, so `/psthg/*` answers, with nothing
   useful.
2. A push to `main` publishes the image and deploys the first real revision.
   From there `/psthg/static/array.js` serves the SDK and `/psthg/i/v0/e/`
   accepts events.
3. The apply also creates the `posthog-project-token` secret, empty. Add the
   project token from PostHog EU — the `phc_` value in its project settings, not
   the `phx_` personal API key — as a version:

   ```sh
   gcloud secrets versions add posthog-project-token --data-file=-
   ```

   The next apply reads it into `NEXT_PUBLIC_POSTHOG_KEY` on the production
   environment, and the release after that builds with analytics on. Rotating
   the token is a new version and an apply, never a commit. Until a version
   exists the variable is empty and the site builds without analytics, which is
   also what every preview build does.

The service takes `INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER`, so the `run.app` URL
Cloud Run assigns it answers nothing. That it stays that way is worth checking
after a deploy:

```sh
curl -i "$(gcloud run services describe posthog-proxy --format='value(status.url)')/psthg/static/array.js"
curl -i https://langri-sha.com/psthg/static/array.js
```

The first must fail to connect or answer 404; the second must serve the SDK.
