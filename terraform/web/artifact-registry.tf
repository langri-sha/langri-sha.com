resource "google_artifact_registry_repository" "repository" {
  for_each = local.artifact_registry_repositories

  location = local.location
  project  = module.project_build.project_id

  description   = each.value.description
  format        = each.value.format
  repository_id = each.key
}
