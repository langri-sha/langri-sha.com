output "service_account" {
  value = google_project_service_identity.cloudbuild
  description = "Cloud Build service account for project."
}
