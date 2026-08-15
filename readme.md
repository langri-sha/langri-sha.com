# langri-sha.com

The site, the edge that previews it, and the Terraform that runs both.

| Path             | What                                                          |
| ---------------- | ------------------------------------------------------------- |
| `apps/web`       | the Next.js site, exported static                             |
| `apps/preview`   | the nginx router in front of the preview revisions            |
| `packages/fonts` | display fonts, subsetted and inlined for the site             |
| `terraform/`     | the GCP projects, buckets, Cloud Run services and DNS records |

## Releasing

Publishing a GitHub release deploys the site: `web.yml` builds it and copies the
export to the production bucket. Pull requests and releases also go up as tagged
Cloud Run revisions, reachable under `/pull/…` and `/release/…` on the preview
host — see [`apps/preview`](apps/preview/readme.md).
