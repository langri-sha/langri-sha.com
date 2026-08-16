resource "google_service_account" "posthog_proxy" {
  account_id   = "posthog-proxy"
  display_name = "PostHog proxy"
  description  = "Runtime identity of the PostHog proxy. It forwards to PostHog and holds no roles."
  project      = var.project
}

resource "google_cloud_run_v2_service" "posthog_proxy" {
  name     = "posthog-proxy"
  location = var.location
  project  = var.project

  ingress             = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  deletion_protection = false

  template {
    service_account                  = google_service_account.posthog_proxy.email
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
    ]
  }
}

resource "google_cloud_run_v2_service_iam_member" "posthog_proxy" {
  location = google_cloud_run_v2_service.posthog_proxy.location
  name     = google_cloud_run_v2_service.posthog_proxy.name
  project  = var.project

  member = "allUsers"
  role   = "roles/run.invoker"
}

resource "google_compute_region_network_endpoint_group" "posthog_proxy" {
  name    = "posthog-proxy-network-endpoint-group"
  project = var.project
  region  = var.location

  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = google_cloud_run_v2_service.posthog_proxy.name
  }
}

resource "google_compute_backend_service" "posthog_proxy" {
  name    = "posthog-proxy-backend-service"
  project = var.project

  load_balancing_scheme = "EXTERNAL"
  timeout_sec           = 30

  enable_cdn = false

  log_config {
    enable = false
  }

  backend {
    group = google_compute_region_network_endpoint_group.posthog_proxy.id
  }
}

resource "google_service_account_iam_binding" "posthog_proxy_deployers" {
  service_account_id = google_service_account.posthog_proxy.name

  members = toset(var.deployers)
  role    = "roles/iam.serviceAccountUser"
}
