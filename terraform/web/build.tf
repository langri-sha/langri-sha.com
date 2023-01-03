module "cloudbuild" {
  source = "github.com/langri-sha/terraform-google-cloud-platform//modules/cloudbuild?ref=v0.2.0"

  project_id = module.project["build"].project_id
  repo_name  = var.repo_name
  repo_owner = var.repo_owner

  triggers = local.triggers
}
