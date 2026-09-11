# previews

An origin behind the preview host. One Cloud Run service carrying a revision per
preview, each reachable at its own traffic tag.

Instantiated once per app, because a traffic tag is not an isolation boundary:
the site's `main` deploy moves its service's traffic to the latest revision,
which would pick up any other app that had deployed into the same service.

The site is the only app here with somewhere else to be, which is why its
service is `web-previews` and the others are named for themselves. An internal
console that only ever runs behind IAP has no production copy to be told apart
from, and a suffix that never distinguishes anything is noise on every app that
follows.

Terraform owns the shape of the service. CI owns what runs on it: the revisions,
their images and their tags. Nothing here is reachable from the internet — the
router in `../previews-router` is the only way in.
