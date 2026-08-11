output "service" {
  value       = google_cloud_run_v2_service.previews_router.name
  description = "Cloud Run service name."
}

output "service_account" {
  value       = google_service_account.previews_router
  description = "Service account for the Cloud Run service."
}
