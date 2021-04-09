module "project_build" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 10.2.2"

  name = "build"

  auto_create_network     = false
  billing_account         = data.terraform_remote_state.org.outputs.billing_account
  default_service_account = "deprivilege"
  folder_id               = data.terraform_remote_state.org.outputs.web_folder
  org_id                  = data.terraform_remote_state.org.outputs.org_id
  random_project_id       = "true"

  activate_apis = [
    "cloudbuild.googleapis.com",
    "compute.googleapis.com",
    "containerregistry.googleapis.com",
  ]
}

module "cloudbuild" {
  source = "../modules/cloudbuild"

  project_id = module.project_build.project_id
  repo_name  = var.repo_name
  repo_owner = var.repo_owner

  triggers = [{
    description = "Terraform Pull Request"
    filename    = "terraform/cloudbuild.yaml"
    name        = "terraform-pull-request"

    included_files = ["docker-compose.yml", "terraform/**"]

    pull_request = {
      branch = ".*"
    }
  }]
}
