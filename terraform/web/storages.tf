resource "google_storage_bucket" "public" {
  for_each = toset(compact([
    for host in local.hosts : contains(keys(local.host_redirects), host) ? "" : host
  ]))

  name    = local.host_names[each.value]
  project = module.project_edge.project_id

  requester_pays = true

  cors {
    max_age_seconds = 60
    method          = ["*"]
    origin          = local.host_cors_origins[each.value]
  }

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}
