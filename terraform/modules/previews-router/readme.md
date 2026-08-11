# previews-router

The front door for previews. One Cloud Run service running the nginx image in
`apps/preview`, which maps a preview selector onto a traffic tag of the origin
service in `../previews` and proxies to that revision.

It reaches the origin over the VPC, because the origin accepts internal traffic
only. That needs two things together: all of the router's egress routed through
the network, and Private Google Access on the subnet it egresses from. Drop
either half and the requests never arrive.
