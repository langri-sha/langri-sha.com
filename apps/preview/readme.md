# preview

The front door for `https://preview.langri-sha.com`. An nginx image that maps a
preview selector onto the Cloud Run revision serving it and proxies there.

The shape is a well-worn one: a single preview host, a small closed set of path
selectors, and one Cloud Run service per app carrying a revision per preview.

## Routing

Previews of the site are tagged revisions of a single `web-previews` service.
Cloud Run publishes every tag at `<tag>---<service host>`, so the router
rewrites the hostname and strips the selector — the origin serves from its own
root and does not know it is mounted at a subpath.

| Request                   | Upstream                               | Upstream path |
| ------------------------- | -------------------------------------- | ------------- |
| `/`, `/anything`          | `web-previews`, untagged               | `/anything`   |
| `/pull/123/about`         | `web-previews`, `pull-123`             | `/about`      |
| `/release/v2.13.0/about`  | `web-previews`, `release-v2-13-0`      | `/about`      |
| `/release/v2.0.0-alpha/…` | `web-previews`, `release-v2-0-0-alpha` | `/…`          |
| `/voice-editor/tuner`     | `voice-editor`, untagged               | `/tuner`      |
| `/pull/123/voice-editor/` | `voice-editor`, `pull-123`             | `/`           |

`main` is the untagged revision, which holds 100% of the service's traffic; pull
request and release revisions are deployed with `--no-traffic` and are reachable
only through their tag. Traffic tags are RFC 1035 labels, which is why the dots
in a release tag become hyphens and a prerelease suffix is held to `[0-9a-z-]`.

Selectors that do not parse — `/pull/abc/`, `/pull/0123/`, a pull request number
past seven digits, `/release/2.13.0/` — answer 404. They deliberately do not
fall through to `main`: a typo'd pull request number must not quietly serve a
different build. `/pull/123` and `/release/v2.13.0` redirect to their trailing
slash form.

## Apps that are not the site

`/voice-editor/` is the tuning console in `apps/voice-editor`, served from an
origin of its own rather than a traffic tag on `web-previews`. A tag is not an
isolation boundary: deploying the site to `main` moves that service's traffic to
its latest revision, so any other app deployed into it is one badly-timed merge
away from being served at the preview root.

The selector names the build and the prefix names the app, so the two compose.
`main` is `/voice-editor/`, on the revision holding the editor's traffic; a pull
request is `/pull/123/voice-editor/`, on the `pull-123` tag of that same
service. The site's `pull-123` tag lives on a different service, so the tag
names the pull request and the service names the app, with no collision between
them.

The tagged form has to be matched before the site's `/pull/` selector, which
would otherwise swallow it and ask the site's build for a route it does not
have. That ordering is why the editor's locations sit first in the file.

A pull request that does not touch the editor has no `pull-<n>` tag on its
service, and `/pull/<n>/voice-editor/` answers Cloud Run's own 404 for an
unknown tag. The workflow runs on the editor and on the workspace packages, so
the URL exists exactly when there is an editor change to look at.

The cost is that `/voice-editor` is reserved on this host, at the root and under
every selector: the site cannot serve a route there. Anything that merely starts
with the same letters — `/voice-editors` — is an ordinary path and still reaches
`main`.

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

| Variable                    | Default           |                                                                                                       |
| --------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| `PORT`                      | `8080`            | Injected by Cloud Run.                                                                                |
| `PREVIEWS_SERVICE_HOST`     | —                 | Host of the `web-previews` service, without a tag or scheme, e.g. `web-previews-abc123-ew.a.run.app`. |
| `RESOLVER`                  | `169.254.169.254` | DNS for the per-request upstream lookup. The metadata server on Cloud Run.                            |
| `VOICE_EDITOR_SERVICE_HOST` | —                 | Host of the `voice-editor` service, without a scheme.                                                 |

Neither service host has a default, on purpose. If one is unset the template
renders the placeholder verbatim, nginx refuses to start on an unknown variable,
and the revision never takes traffic — a louder failure than silently routing
somewhere plausible.

## Development

```sh
docker compose up --build --force-recreate preview
```

The upstream is a placeholder that does not resolve, so requests that route
correctly fail at DNS. That is the point: the error log records the hostname the
router constructed, which is the behaviour worth checking.

```sh
curl -i http://localhost:9001/pull/1234/foobar
curl -i http://localhost:9001/voice-editor/
docker compose logs preview   # …pull-1234---previews.invalid could not be resolved
```

Point it at something real to serve actual bytes:

```sh
PREVIEWS_SERVICE_HOST=web-previews-abc123-ew.a.run.app \
VOICE_EDITOR_SERVICE_HOST=voice-editor-abc123-ew.a.run.app \
  docker compose up --build --force-recreate preview
```

To read the rendered config rather than infer it:

```sh
docker compose run --rm --entrypoint nginx preview -T
```
