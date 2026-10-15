# Agents orientation — `langri-sha/langri-sha.com`

The site at [langri-sha.com](https://langri-sha.com), the services in front of
it, and the Terraform that runs them on Google Cloud. A pnpm workspace whose
tooling projen manages and whose checks run through Dagger.

```text
apps/
  web/           # the site, a static Next.js export
  preview/       # nginx router for preview.langri-sha.com
  posthog/       # nginx proxy serving PostHog from the site's domain
  voice-editor/  # Next.js tuning console for the voice, deployed as a preview
packages/        # private workspace packages: fonts, glsl-loader, next, voice
terraform/
  web/           # the root module
  modules/       # modules only terraform/web uses
.projenrc.ts     # the workspace and every packages/* subproject
dagger.toml      # the Dagger modules behind dagger check and generate
```

## Who owns which file

Projen writes the root `package.json`, every `packages/*/package.json`, and the
files listed in `.projen/files.json` and `packages/*/.projen/files.json`; they
are read-only. Change them in `.projenrc.ts`, then run `pnpm exec projen`. The
apps are not projen subprojects: `apps/*/package.json`, their tsconfigs and
Next.js configs are edited by hand, as are the readmes.

`dagger generate` also sorts every `package.json` and refreshes
`terraform/web/.terraform.lock.hcl`.

Repository settings, branch protection and the mal-the-kron App's Actions
secrets are managed by Terraform outside this repository; don't change them in
the GitHub UI. The Actions variables, the `preview` and `production`
environments and the deploy service account are managed by `terraform/web`;
change them there, never in the GitHub UI.

## Common tasks

```sh
pnpm install
pnpm exec projen  # re-synthesize from .projenrc.ts
dagger check      # lint, type-check and test everything
dagger generate   # update generated and lock files that are out of date
pnpm start        # next dev for apps/web
```

CI (`workspace.yml` → `langri-sha/github` `check.yml`) runs `dagger check`:
ESLint, Prettier, Vitest, `tsc --build`, and Terraform `fmt`, `validate` and
`test` on `terraform/web`. On Renovate pull requests it applies lint fixes,
re-synthesizes and commits the result.

## Deploys

| Workflow             | Trigger                                     | Deploys                                                        |
| -------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| `web.yml`            | a published GitHub release                  | `apps/web` to the production buckets, then invalidates the CDN |
| `web.yml`            | every pull request, push to `main`, release | `apps/web` as a preview revision on Cloud Run                  |
| `voice-editor.yml`   | changes to `apps/voice-editor` or packages  | `apps/voice-editor` as a preview revision on Cloud Run         |
| `preview-router.yml` | push to `main` touching `apps/preview`      | the preview router image                                       |
| `posthog-proxy.yml`  | push to `main` touching `apps/posthog`      | the PostHog proxy image                                        |

Releases are tagged `vX.Y.Z`. The preview, router and proxy jobs are skipped
until `terraform/web` has created the Actions variable naming their service.
[`apps/preview`](apps/preview/readme.md) documents how preview URLs route.

## Terraform

`terraform/web` is the only root module. State is in HCP Terraform, organization
`langri-sha`, workspace `web`, but plans and applies run from your machine;
nothing in CI applies. Use the exact Terraform version pinned in
`terraform/web/versions.tf`. A run needs an HCP login, Google application
default credentials and a `GITHUB_TOKEN` for the github provider; the
`terraform-web` service in `docker-compose.yml` mounts the first two and passes
the token through.

`terraform/web` reads outputs of the `org` HCP Terraform workspace: apply a
change to those outputs there first.
