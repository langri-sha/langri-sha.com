output "backend_service" {
  value       = google_compute_backend_service.posthog_proxy.self_link
  description = "Backend service the load balancer routes /psthg and /psthg/* to."
}

output "service" {
  value       = google_cloud_run_v2_service.posthog_proxy.name
  description = "Cloud Run service name."
}

output "service_account" {
  value       = google_service_account.posthog_proxy
  description = "Service account for the Cloud Run service."
}
