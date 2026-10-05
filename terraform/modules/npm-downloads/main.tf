resource "google_service_account" "npm_downloads" {
  account_id   = var.name
  display_name = var.name
  description  = "Runtime identity of the ${var.name} job. It reads the PostHog project token and holds no roles."
  project      = var.project
}

resource "google_secret_manager_secret_iam_member" "npm_downloads" {
  project   = var.project
  secret_id = var.posthog_project_token_secret

  member = "serviceAccount:${google_service_account.npm_downloads.email}"
  role   = "roles/secretmanager.secretAccessor"
}

resource "google_cloud_run_v2_job" "npm_downloads" {
  name     = var.name
  location = var.location
  project  = var.project

  deletion_protection = false

  template {
    template {
      service_account = google_service_account.npm_downloads.email

      # A failed run is better retried by hand than straight away: what fails
      # it is npm not having counted the day yet, or PostHog turning it down.
      max_retries = 0
      timeout     = "1800s"

      containers {
        image = var.image

        env {
          name = "POSTHOG_PROJECT_TOKEN"

          value_source {
            secret_key_ref {
              secret  = var.posthog_project_token_secret
              version = "latest"
            }
          }
        }

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      client,
      client_version,
      template[0].template[0].containers[0].image,
    ]
  }

  depends_on = [google_secret_manager_secret_iam_member.npm_downloads]
}

resource "google_service_account_iam_binding" "npm_downloads_deployers" {
  service_account_id = google_service_account.npm_downloads.name

  members = toset(var.deployers)
  role    = "roles/iam.serviceAccountUser"
}

resource "google_service_account" "scheduler" {
  account_id   = "${var.name}-scheduler"
  display_name = "${var.name}-scheduler"
  description  = "Identity Cloud Scheduler runs the ${var.name} job as. It may run that job and nothing else."
  project      = var.project
}

resource "google_cloud_run_v2_job_iam_member" "scheduler" {
  location = google_cloud_run_v2_job.npm_downloads.location
  name     = google_cloud_run_v2_job.npm_downloads.name
  project  = var.project

  member = "serviceAccount:${google_service_account.scheduler.email}"
  role   = "roles/run.invoker"
}

resource "google_cloud_scheduler_job" "npm_downloads" {
  name    = var.name
  project = var.project
  region  = var.location

  schedule  = var.schedule
  time_zone = "Etc/UTC"

  http_target {
    http_method = "POST"
    uri         = "https://run.googleapis.com/v2/${google_cloud_run_v2_job.npm_downloads.id}:run"

    oauth_token {
      service_account_email = google_service_account.scheduler.email
    }
  }

  depends_on = [google_cloud_run_v2_job_iam_member.scheduler]
}
