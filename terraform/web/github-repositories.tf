module "github_repositories" {
  source = "../modules/telemetry-job"

  deployers             = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  image                 = var.github_repositories_image
  location              = local.region
  name                  = "github-repositories"
  posthog_project_token = posthog_project.web.api_token
  project               = module.project["edge"].project_id
  schedule              = "37 14 * * *"

  secrets = {
    GITHUB_APP_CLIENT_ID   = local.mal_the_kron_secrets["mal-the-kron-client-id"]
    GITHUB_APP_PRIVATE_KEY = local.mal_the_kron_secrets["mal-the-kron-private-key"]
  }
}
