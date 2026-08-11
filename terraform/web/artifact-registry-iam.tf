resource "google_artifact_registry_repository_iam_member" "serverless_robot" {
  location   = google_artifact_registry_repository.repository["docker"].location
  project    = module.project["build"].project_id
  repository = google_artifact_registry_repository.repository["docker"].name

  member = "serviceAccount:service-${module.project["edge"].project_number}@serverless-robot-prod.iam.gserviceaccount.com"
  role   = "roles/artifactregistry.reader"
}

resource "google_artifact_registry_repository_iam_member" "github" {
  location   = google_artifact_registry_repository.repository["docker"].location
  project    = module.project["build"].project_id
  repository = google_artifact_registry_repository.repository["docker"].name

  member = "serviceAccount:${module.github["langri-sha.com"].service_account.email}"
  role   = "roles/artifactregistry.writer"
}
