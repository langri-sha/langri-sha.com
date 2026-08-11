resource "google_project_iam_member" "cloud_run_deployer" {
  project = module.project["edge"].project_id

  member = "serviceAccount:${module.github["langri-sha.com"].service_account.email}"
  role   = "roles/run.developer"
}
