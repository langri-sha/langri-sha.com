data "google_iam_policy" "public_storage_bucket" {
  binding {
    members = [
      "allUsers",
    ]
    role = "roles/storage.objectViewer"
  }

  binding {
    members = [
      "serviceAccount:${module.cloudbuild.service_account_email}"
    ]
    role = "roles/storage.objectAdmin"
  }
}

resource "google_storage_bucket" "public" {
  for_each = toset(compact([
    for host in local.hosts : contains(keys(local.host_redirects), host) ? "" : host
  ]))

  name    = local.host_names[each.value]
  project = module.project_edge.project_id

  requester_pays              = true
  uniform_bucket_level_access = true

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

resource "google_storage_bucket_iam_policy" "default" {
  for_each = toset(compact([
    for host in local.hosts : contains(keys(local.host_redirects), host) ? "" : host
  ]))

  bucket      = google_storage_bucket.public[each.value].name
  policy_data = data.google_iam_policy.public_storage_bucket.policy_data
}
