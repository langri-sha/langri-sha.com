module "cloudbuild" {
  source = "../modules/cloudbuild"

  project_id = module.project_build.project_id
  repo_name  = var.repo_name
  repo_owner = var.repo_owner

  triggers = local.triggers
}
