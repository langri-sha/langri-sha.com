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
`dagger.toml` installs the official ESLint, Prettier and Vitest modules,
`.dagger/modules/ci` covers TypeScript, projen and the package manifests, and
`.dagger/modules/terraform` covers Terraform formatting, validation, tests and
the lock file.

```shell
dagger check -l   # list the checks
dagger check      # run them all, in parallel
dagger generate   # apply what the projen, packages and lock checks found stale
```

Every step is cached by its inputs, so a second run over an unchanged tree
replays from cache, and a change reruns only the steps downstream of it. The
checks run in pinned containers, whatever the host has installed: `node:24-slim`
for the JavaScript ones, and for Terraform the `hashicorp/terraform` tag that
`required_version` pins in `terraform/web/versions.tf`.

The Terraform checks stay credential-free — `init` runs with `-backend=false`
and the tests mock their providers — so `plan` and `apply` are out of scope.

`workspace.yml` runs `dagger check` on GitHub Actions for every pull request and
push to `main`, through the shared `check.yml` workflow, on the engine version
the modules' `engineVersion` pins. Hosted runners start each run with a cold
engine, so those runs never replay from cache. `web.yml` and the Renovate
post-upgrade job need OIDC, secrets or push access, and are not checks Dagger
runs. [Cloud Checks](https://docs.dagger.io/cloud-checks) could take over on
Dagger's engines once the repository is connected with `dagger cloud checks on`;
`dagger workspace activity` shows the runs.

## Releasing

Publishing a GitHub release deploys the site: `web.yml` builds it and copies the
export to the production bucket. Pull requests and releases also go up as tagged
Cloud Run revisions, reachable under `/pull/…` and `/release/…` on the preview
host — see [`apps/preview`](apps/preview/readme.md).
