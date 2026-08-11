output "service" {
  value       = google_cloud_run_v2_service.previews_router.name
  description = "Cloud Run service name."
}

output "service_account" {
  value       = google_service_account.previews_router
  description = "Service account for the Cloud Run service."
}

output "backend_service" {
  value       = google_compute_backend_service.previews_router.self_link
  description = "Backend service the load balancer routes preview selectors to."
}

output "enabled" {
  value       = local.enabled
  description = "Whether IAP is configured. The router must not join the URL map until it is."
}
