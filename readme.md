# langri-sha.com

The site at [langri-sha.com](https://langri-sha.com), a few jobs that chart npm
package activity in PostHog, and the Terraform that runs them on Google Cloud.

| Path                   | What                                                   |
| ---------------------- | ------------------------------------------------------ |
| `apps/web`             | The site, a static Next.js export                      |
| `apps/preview`         | Routes preview URLs to pull request and release builds |
| `apps/posthog`         | Serves PostHog analytics from the site's own domain    |
| `apps/voice-editor`    | A tuning console for the site's voice                  |
| `apps/npm-downloads`   | Daily job sending npm download counts to PostHog       |
| `apps/npm-releases`    | Hourly job sending npm release activity to PostHog     |
| `packages/fonts`       | Subsetted display fonts for the site                   |
| `packages/glsl-loader` | Imports GLSL shaders as strings                        |
| `packages/next`        | Next.js helpers shared between apps                    |
| `packages/telemetry`   | Code the Rust jobs share                               |
| `packages/voice`       | The throat-sung voice, as a Web Audio graph            |
| `terraform/`           | Google Cloud projects, services, buckets and DNS       |

## Development

Checks run with [Dagger](https://docs.dagger.io), the same locally and in CI:

```shell
dagger check      # lint, type-check and test everything
dagger generate   # update generated and lock files that are out of date
```

## Releasing

Publishing a GitHub release deploys the site. Every pull request and release
also gets a preview at `preview.langri-sha.com/pull/<n>/` or
`/release/<version>/` — see [`apps/preview`](apps/preview/readme.md).
