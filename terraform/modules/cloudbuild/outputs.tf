output "service_account_email" {
  value = google_project_service_identity.cloudbuild.email
  description = "Cloud Build service account email for the project."
}
