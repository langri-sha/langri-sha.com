terraform {
  experiments = [ module_variable_optional_attrs ]
}

resource "google_project_service_identity" "cloudbuild" {
  provider = google-beta

  project = var.project_id
  service = "cloudbuild.googleapis.com"
}

resource "google_cloudbuild_trigger" "triggers" {
  provider = google-beta

  for_each = { for trigger in var.triggers : trigger.name => trigger }

  description   = each.value.description
  filename      = each.value.filename
  name          = each.value.name
  project       = var.project_id
  substitutions = each.value.substitutions

  included_files = each.value.included_files

  github {
    name = var.repo_name
    owner = var.repo_owner

    dynamic "pull_request" {
      for_each = each.value.pull_request != null ? [each.value.pull_request] : []

      content {
        branch = pull_request.value.branch
      }
    }

    dynamic "push" {
      for_each = each.value.push != null ? [each.value.push] : []

      content {
        branch = push.value.branch
        tag    = push.value.tag
      }
    }
  }
}

resource "google_project_iam_member" "cloudbuild_service_usage_consumer" {
  project = var.project_id
  role    = "roles/serviceusage.serviceUsageConsumer"
  member  = "serviceAccount:${google_project_service_identity.cloudbuild.email}"
}
