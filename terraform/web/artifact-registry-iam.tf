resource "google_artifact_registry_repository_iam_member" "github" {
  location   = google_artifact_registry_repository.repository["docker"].location
  project    = module.project["build"].project_id
  repository = google_artifact_registry_repository.repository["docker"].name

  member = "serviceAccount:${module.github["langri-sha.com"].service_account.email}"
  role   = "roles/artifactregistry.writer"
}
