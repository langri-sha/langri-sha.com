# langri-sha.com

The site, the edge that previews it, and the Terraform that runs both.

| Path                 | What                                                                    |
| -------------------- | ----------------------------------------------------------------------- |
| `apps/web`           | the Next.js site, exported static                                       |
| `apps/preview`       | the nginx router in front of the preview revisions                      |
| `apps/npm-downloads` | the daily job publishing npm package downloads to PostHog               |
| `packages/fonts`     | display fonts, subsetted and inlined for the site                       |
| `terraform/`         | the GCP projects, buckets, Cloud Run services and jobs, and DNS records |

## Checks

The workspace checks run through [Dagger](https://docs.dagger.io) 1.0 beta:
`dagger.toml` installs the official ESLint, Prettier and Vitest modules, and
`cargo`, `ci` and `terraform` from
[langri-sha/dagger](https://github.com/langri-sha/dagger): `cargo` covers the
Rust formatting, Clippy lints, tests and lock file, `ci` covers TypeScript,
projen and the package manifests, and `terraform` covers Terraform formatting,
validation, tests and the lock file.

```shell
dagger check -l   # list the checks
dagger check      # run them all, in parallel
dagger generate   # apply what the projen, packages and lock checks found stale
```

Every step is cached by its inputs, so a second run over an unchanged tree
replays from cache, and a change reruns only the steps downstream of it. The
checks run in pinned containers, whatever the host has installed: `node:24-slim`
for the JavaScript ones, `rust:1-slim` with the toolchain `rust-toolchain.toml`
names for Rust, and for Terraform the `hashicorp/terraform` tag that
`required_version` pins in `terraform/web/versions.tf`.

The Terraform checks stay credential-free — `init` runs with `-backend=false`
and the tests mock their providers — so `plan` and `apply` are out of scope.

`workspace.yml` runs `dagger check` on GitHub Actions for every pull request and
push to `main`, through the shared `check.yml` workflow, on the Dagger version
it pins with `dagger-version`. Hosted runners start each run with a cold engine,
so those runs never replay from cache. `web.yml` and the Renovate post-upgrade
job need OIDC, secrets or push access, and are not checks Dagger runs.
[Cloud Checks](https://docs.dagger.io/cloud-checks) could take over on Dagger's
engines once the repository is connected with `dagger cloud checks on`;
`dagger workspace activity` shows the runs.

## Releasing

Publishing a GitHub release deploys the site: `web.yml` builds it and copies the
export to the production bucket. Pull requests and releases also go up as tagged
Cloud Run revisions, reachable under `/pull/…` and `/release/…` on the preview
host — see [`apps/preview`](apps/preview/readme.md).

## npm downloads

`apps/npm-downloads` publishes how often each package the `malkron` npm user
maintains was downloaded: one `npm_package_downloads` event per package and day,
with `package`, `repository` and `downloads` properties. It runs as a Cloud Run
job that Cloud Scheduler starts daily, for the day before yesterday, since npm
takes over a day to count one, with the project token Terraform reads off the
PostHog project. `npm-downloads.yml` deploys its image on every push to `main` —
see
[`terraform/modules/npm-downloads`](terraform/modules/npm-downloads/readme.md).
The pinned _npm downloads_ dashboard in PostHog charts them per package, per
repository and per week, and lists the top packages of the last 30 days.

Events are identified by package and day, so a day published again replaces its
counts rather than adding to them — once PostHog has merged the duplicates in
the background, which can take a while. Backfill by running the job with
arguments, or locally, where `--dry-run` prints the events instead:

```shell
gcloud run jobs execute npm-downloads --project <edge> --region us-west1 --args=--from,2025-04-01
POSTHOG_PROJECT_TOKEN=phc_… cargo run -p npm-downloads -- --from 2025-04-01
```
