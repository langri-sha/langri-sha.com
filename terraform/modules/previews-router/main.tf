locals {
  enabled = var.iap_oauth2_secrets != null
}

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

resource "google_cloud_run_v2_service_iam_member" "previews_router" {
  location = google_cloud_run_v2_service.previews_router.location
  name     = google_cloud_run_v2_service.previews_router.name
  project  = var.project

  member = "allUsers"
  role   = "roles/run.invoker"
}

resource "google_compute_region_network_endpoint_group" "previews_router" {
  name    = "preview-router-network-endpoint-group"
  project = var.project
  region  = var.location

  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = google_cloud_run_v2_service.previews_router.name
  }
}

data "google_secret_manager_secret_version" "iap_oauth2_client_id" {
  count = local.enabled ? 1 : 0

  secret = var.iap_oauth2_secrets.client_id
}

data "google_secret_manager_secret_version" "iap_oauth2_client_secret" {
  count = local.enabled ? 1 : 0

  secret = var.iap_oauth2_secrets.client_secret
}

resource "google_compute_backend_service" "previews_router" {
  name    = "preview-router-backend-service"
  project = var.project

  load_balancing_scheme = "EXTERNAL"
  timeout_sec           = 30
  enable_cdn            = false

  backend {
    group = google_compute_region_network_endpoint_group.previews_router.id
  }

  log_config {
    enable      = true
    sample_rate = 1.0
  }

  dynamic "iap" {
    for_each = local.enabled ? [1] : []

    content {
      enabled              = true
      oauth2_client_id     = data.google_secret_manager_secret_version.iap_oauth2_client_id[0].secret_data
      oauth2_client_secret = data.google_secret_manager_secret_version.iap_oauth2_client_secret[0].secret_data
    }
  }
}

resource "google_iap_web_backend_service_iam_member" "previews_router" {
  for_each = local.enabled ? toset(var.members) : toset([])

  project             = var.project
  web_backend_service = google_compute_backend_service.previews_router.name

  member = each.value
  role   = "roles/iap.httpsResourceAccessor"
}
