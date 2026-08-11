output "service_account" {
  value       = google_service_account.previews
  description = "Service account for the Cloud Run service."
}
