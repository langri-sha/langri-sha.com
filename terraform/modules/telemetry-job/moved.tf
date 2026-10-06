moved {
  from = google_service_account.npm_downloads
  to   = google_service_account.job
}

moved {
  from = google_cloud_run_v2_job.npm_downloads
  to   = google_cloud_run_v2_job.job
}

moved {
  from = google_service_account_iam_binding.npm_downloads_deployers
  to   = google_service_account_iam_binding.deployers
}

moved {
  from = google_cloud_scheduler_job.npm_downloads
  to   = google_cloud_scheduler_job.job
}
