output "service" {
  value       = google_cloud_run_v2_service.previews.name
  description = "Cloud Run service name."
}

output "service_account" {
  value       = google_service_account.previews
  description = "Service account for the Cloud Run service."
}

output "service_url" {
  value       = google_cloud_run_v2_service.previews.uri
  description = "Cloud Run service URL. Tagged revisions are published at <tag>---<host> of this URL."
}
