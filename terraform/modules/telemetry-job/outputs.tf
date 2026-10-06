output "job" {
  value       = google_cloud_run_v2_job.job.name
  description = "Cloud Run job name."
}

output "service_account" {
  value       = google_service_account.job
  description = "Service account the Cloud Run job runs as."
}
