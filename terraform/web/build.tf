module "cloudbuild" {
  source = "../modules/cloudbuild"

  project_id = module.project_build.project_id
  repo_name  = var.repo_name
  repo_owner = var.repo_owner

  triggers = [
    {
      description = "Terraform Pull Request"
      filename    = "terraform/cloudbuild.yaml"
      name        = "terraform-pull-request"

      included_files = ["docker-compose.yml", "terraform/**"]

      pull_request = {
        branch = ".*"
      }
    },

    {
      description = "Workspace Pull Request"
      filename    = "cloudbuild.yaml"
      name        = "workspace-pull-request"

      ignored_files = ["terraform/**"]

      pull_request = {
        branch = ".*"
      }
    }
  ]
}
