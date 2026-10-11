module "npm_downloads" {
  source = "../modules/telemetry-job"

  deployers             = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  image                 = var.npm_downloads_image
  location              = local.region
  name                  = "npm-downloads"
  posthog_project_token = posthog_project.web.api_token
  project               = module.project["edge"].project_id
  schedule              = "17 12 * * *"
}
