resource "google_service_account" "previews_router" {
  account_id   = "preview-router"
  display_name = "Preview router"
  description  = "Runtime identity of the preview router. It proxies to the origin service and holds no roles."
  project      = var.project
}

resource "google_cloud_run_v2_service" "previews_router" {
  name     = "preview-router"
  location = var.location
  project  = var.project

  ingress             = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  deletion_protection = false

  template {
    service_account                  = google_service_account.previews_router.email
    max_instance_request_concurrency = 80

    scaling {
      max_instance_count = 4
      min_instance_count = 0
    }

    vpc_access {
      egress = "ALL_TRAFFIC"

      network_interfaces {
        network    = var.network
        subnetwork = var.subnetwork
      }
    }

    containers {
      image = var.image

      ports {
        container_port = 8080
      }

      env {
        name  = "PREVIEWS_SERVICE_HOST"
        value = var.previews_service_host
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
