# preview

The router behind `https://preview.langri-sha.com`. An nginx image that sends
each preview URL to the Cloud Run revision built for it.

## Routing

| Request                   | Upstream                               | Upstream path |
| ------------------------- | -------------------------------------- | ------------- |
| `/`, `/anything`          | `web-previews`, untagged               | `/anything`   |
| `/pull/123/about`         | `web-previews`, `pull-123`             | `/about`      |
| `/release/v2.13.0/about`  | `web-previews`, `release-v2-13-0`      | `/about`      |
| `/release/v2.0.0-alpha/…` | `web-previews`, `release-v2-0-0-alpha` | `/…`          |
| `/voice-editor/tuner`     | `voice-editor`, untagged               | `/tuner`      |
| `/pull/123/voice-editor/` | `voice-editor`, `pull-123`             | `/`           |

`main` is served at the root. Each pull request and release is deployed as a
tagged revision that takes no traffic of its own and is reachable only through
its path here. Cloud Run tags can't contain dots, so a release's dots become
hyphens.

A malformed path such as `/pull/abc/` or `/release/2.13.0/` answers 404 rather
than falling back to `main`, so a typo never quietly shows a different build.

## The voice editor

`/voice-editor/` serves [`apps/voice-editor`](../voice-editor/readme.md) from a
Cloud Run service of its own, so deploying the site can never displace it. A
pull request preview of the editor, at `/pull/<n>/voice-editor/`, exists only
when the pull request changes the editor.

The site can't use `/voice-editor` as a route, at the root or under a preview.

In `preview-router.conf.template`, the editor's `location` blocks must come
before the site's `/pull/` selector, or it swallows the editor's previews.

## Security

Identity headers that Google's Identity-Aware Proxy sets are cleared from every
incoming request, so a forged one never reaches an upstream or a log. The router
doesn't check identity itself; IAP does.

Caching, security headers and error pages are the preview origin's job. The
router only routes.

## Configuration

| Variable                    | Default           |                                                                                                       |
| --------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| `PORT`                      | `8080`            | Injected by Cloud Run.                                                                                |
| `PREVIEWS_SERVICE_HOST`     | —                 | Host of the `web-previews` service, without a tag or scheme, e.g. `web-previews-abc123-ew.a.run.app`. |
| `RESOLVER`                  | `169.254.169.254` | DNS for the per-request upstream lookup. The metadata server on Cloud Run.                            |
| `VOICE_EDITOR_SERVICE_HOST` | —                 | Host of the `voice-editor` service, without a scheme.                                                 |

Neither service host has a default, on purpose: if one is missing, nginx refuses
to start rather than routing somewhere plausible.

## Development

```sh
docker compose up --build --force-recreate preview
curl -i http://localhost:9001/pull/1234/foobar
docker compose logs preview   # …pull-1234---previews.invalid could not be resolved
```

The default upstream doesn't resolve, so the log shows the host each request was
routed to. Set `PREVIEWS_SERVICE_HOST` and `VOICE_EDITOR_SERVICE_HOST` to real
service hosts to serve actual pages.
