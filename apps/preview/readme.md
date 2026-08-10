# preview

The front door for `https://preview.langri-sha.com`. An nginx image that maps a
preview selector onto a Cloud Run traffic tag and proxies to that revision.

The shape is a well-worn one: a single preview host, a small closed set of path
selectors, and one Cloud Run service carrying a revision per preview.

## Routing

Previews are tagged revisions of a single `web-previews` service. Cloud Run
publishes every tag at `<tag>---<service host>`, so the router rewrites the
hostname and strips the selector — the origin serves the site from its own root
and does not know it is mounted at a subpath.

| Request                   | Traffic tag            | Upstream path |
| ------------------------- | ---------------------- | ------------- |
| `/`, `/anything`          | _(untagged)_           | `/anything`   |
| `/pull/123/about`         | `pull-123`             | `/about`      |
| `/release/v2.13.0/about`  | `release-v2-13-0`      | `/about`      |
| `/release/v2.0.0-alpha/…` | `release-v2-0-0-alpha` | `/…`          |

`main` is the untagged revision, which holds 100% of the service's traffic; pull
request and release revisions are deployed with `--no-traffic` and are reachable
only through their tag. Traffic tags are RFC 1035 labels, which is why the dots
in a release tag become hyphens and a prerelease suffix is held to `[0-9a-z-]`.

Selectors that do not parse — `/pull/abc/`, `/pull/0123/`, a pull request number
past seven digits, `/release/2.13.0/` — answer 404. They deliberately do not
fall through to `main`: a typo'd pull request number must not quietly serve a
different build. `/pull/123` and `/release/v2.13.0` redirect to their trailing
slash form.

## Identity headers

`x-goog-iap-jwt-assertion` and the `x-goog-authenticated-user-*` pair are
cleared on every inbound request before anything else happens. IAP sets them on
requests it has authenticated; a request that arrives with them already set is
forged, and must not reach an upstream or a log line. The router does not read
them — authorization is IAP's, and a verification bug that fails open here would
be worse than not looking.

## What this image does not do

Response policy — `Cache-Control`, `X-Robots-Tag`, security headers, SPA
fallback, `404.html` — belongs to the preview origin image. The router only
routes.

## Configuration

| Variable                | Default           |                                                                                                       |
| ----------------------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| `PORT`                  | `8080`            | Injected by Cloud Run.                                                                                |
| `PREVIEWS_SERVICE_HOST` | —                 | Host of the `web-previews` service, without a tag or scheme, e.g. `web-previews-abc123-ew.a.run.app`. |
| `RESOLVER`              | `169.254.169.254` | DNS for the per-request upstream lookup. The metadata server on Cloud Run.                            |

`PREVIEWS_SERVICE_HOST` has no default on purpose. If it is unset the template
renders the placeholder verbatim and every proxied request fails, which is a
louder failure than silently routing somewhere plausible.

## Development

```sh
docker compose up --build --force-recreate preview
```

The upstream is a placeholder that does not resolve, so requests that route
correctly fail at DNS. That is the point: the error log records the hostname the
router constructed, which is the behaviour worth checking.

```sh
curl -i http://localhost:9001/pull/1234/foobar
docker compose logs preview   # …pull-1234---previews.invalid could not be resolved
```

Point it at something real to serve actual bytes:

```sh
PREVIEWS_SERVICE_HOST=web-previews-abc123-ew.a.run.app \
  docker compose up --build --force-recreate preview
```

To read the rendered config rather than infer it:

```sh
docker compose run --rm --entrypoint nginx preview -T
```
