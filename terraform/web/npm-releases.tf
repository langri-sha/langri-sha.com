module "npm_releases" {
  source = "../modules/telemetry-job"

  deployers             = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  image                 = var.npm_releases_image
  location              = local.region
  name                  = "npm-releases"
  posthog_project_token = posthog_project.web.api_token
  project               = module.project["edge"].project_id
  schedule              = "7 * * * *"

  secrets = {
    GITHUB_APP_CLIENT_ID   = local.mal_the_kron_secrets["mal-the-kron-client-id"]
    GITHUB_APP_PRIVATE_KEY = local.mal_the_kron_secrets["mal-the-kron-private-key"]
  }
}
