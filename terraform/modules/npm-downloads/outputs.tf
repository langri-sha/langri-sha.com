output "job" {
  value       = google_cloud_run_v2_job.npm_downloads.name
  description = "Cloud Run job name."
}

output "service_account" {
  value       = google_service_account.npm_downloads
  description = "Service account the Cloud Run job runs as."
}
