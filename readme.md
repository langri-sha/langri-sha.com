# langri-sha.com

The site, the edge that previews it, and the Terraform that runs both.

| Path             | What                                                          |
| ---------------- | ------------------------------------------------------------- |
| `apps/web`       | the Next.js site, exported static                             |
| `apps/preview`   | the nginx router in front of the preview revisions            |
| `packages/fonts` | display fonts, subsetted and inlined for the site             |
| `terraform/`     | the GCP projects, buckets, Cloud Run services and DNS records |

## Checks

The workspace checks run through [Dagger](https://docs.dagger.io) 1.0 beta:
`dagger.toml` installs the official ESLint, Prettier and Vitest modules, and
`.dagger/modules/ci` covers TypeScript, projen and the package manifests.

```shell
dagger check -l   # list the checks
dagger check      # run them all, in parallel
dagger generate   # apply what the projen and packages checks found stale
```

Every step is cached by its inputs, so a second run over an unchanged tree
replays from cache, and a change reruns only the steps downstream of it. The
checks run in the `node:24-slim` container pinned in `dagger.toml`, whatever
Node the host has.

`workspace.yml` still runs the same checks on GitHub Actions. `web.yml`,
`terraform.yml` and the Renovate post-upgrade job need OIDC, secrets or push
access, and are not checks Dagger runs.
[Cloud Checks](https://docs.dagger.io/getting-started/cloud-checks) run
`dagger check` on Dagger's engines after each push, once the repository is
connected with `dagger cloud checks on`; `dagger activity` shows the runs.

## Releasing

Publishing a GitHub release deploys the site: `web.yml` builds it and copies the
export to the production bucket. Pull requests and releases also go up as tagged
Cloud Run revisions, reachable under `/pull/…` and `/release/…` on the preview
host — see [`apps/preview`](apps/preview/readme.md).
