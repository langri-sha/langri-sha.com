module "npm_downloads" {
  source = "../modules/npm-downloads"

  deployers                    = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  image                        = var.npm_downloads_image
  location                     = local.region
  posthog_project_token_secret = module.secrets["posthog-proxy"].secret_names["posthog-project-token"]
  project                      = module.project["edge"].project_id
  schedule                     = "17 12 * * *"
}
