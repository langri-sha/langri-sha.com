resource "google_service_account" "previews" {
  account_id   = "web-previews"
  display_name = "Web previews"
  description  = "Runtime identity of the preview origin service. It serves files baked into its own image and holds no roles."
  project      = var.project
}

resource "google_cloud_run_v2_service" "previews" {
  name     = "web-previews"
  location = var.location
  project  = var.project

  ingress             = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  deletion_protection = false

  template {
    service_account                  = google_service_account.previews.email
    max_instance_request_concurrency = 80

    scaling {
      max_instance_count = 4
      min_instance_count = 0
    }

    containers {
      image = var.image

      ports {
        container_port = 8080
      }

      resources {
        cpu_idle = true

        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      client,
      client_version,
      template[0].containers[0].image,
      template[0].revision,
      traffic,
    ]
  }
}

resource "google_cloud_run_v2_service_iam_member" "previews" {
  location = google_cloud_run_v2_service.previews.location
  name     = google_cloud_run_v2_service.previews.name
  project  = var.project

  member = "allUsers"
  role   = "roles/run.invoker"
}

resource "google_service_account_iam_binding" "previews_deployers" {
  service_account_id = google_service_account.previews.name

  members = toset(var.deployers)
  role    = "roles/iam.serviceAccountUser"
}
