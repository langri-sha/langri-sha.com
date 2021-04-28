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

      substitutions = {
        "_PREVIEW_ASSETS_BUCKET"    = google_storage_bucket.public["preview-assets"].name
        "_PREVIEW_ASSETS_URL"       = local.host_urls["preview-assets"]
        "_PREVIEW_BUCKET"           = google_storage_bucket.public["preview"].name
        "_PREVIEW_URL"              = local.host_urls["preview"]
        "_PRODUCTION_ASSETS_BUCKET" = google_storage_bucket.public["production-assets"].name
        "_PRODUCTION_ASSETS_URL"    = local.host_urls["production-assets"]
        "_PRODUCTION_BUCKET"        = google_storage_bucket.public["production"].name
        "_PRODUCTION_URL"           = local.host_urls["production"]
      }

      ignored_files = ["terraform/**"]

      pull_request = {
        branch = ".*"
      }
    }
  ]
}
