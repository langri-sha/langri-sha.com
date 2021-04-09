resource "google_project_service_identity" "cloudbuild" {
  provider = google-beta

  project = var.project_id
  service = "cloudbuild.googleapis.com"
}
