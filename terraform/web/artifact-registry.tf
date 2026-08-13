resource "google_artifact_registry_repository" "repository" {
  for_each = local.artifact_registry_repositories

  location = local.location
  project  = module.project["build"].project_id

  description   = each.value.description
  format        = each.value.format
  repository_id = each.key
}

resource "google_artifact_registry_repository_iam_member" "repository" {
  for_each = local.artifact_registry_repository_iam_members

  location   = google_artifact_registry_repository.repository[each.value.repository].location
  project    = google_artifact_registry_repository.repository[each.value.repository].project
  repository = google_artifact_registry_repository.repository[each.value.repository].name

  member = each.value.member
  role   = each.value.role
}
