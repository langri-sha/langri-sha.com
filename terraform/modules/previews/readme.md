# previews

The origin previews are served from. One Cloud Run service carrying a revision
per preview, each reachable at its own traffic tag.

Terraform owns the shape of the service. CI owns what runs on it: the revisions,
their images and their tags. Nothing here is reachable from the internet — the
router in `../previews-router` is the only way in.
