module "npm_downloads" {
  source = "../modules/npm-downloads"

  deployers             = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  image                 = var.npm_downloads_image
  location              = local.region
  posthog_project_token = posthog_project.web.api_token
  project               = module.project["edge"].project_id
  schedule              = "17 12 * * *"
}

resource "posthog_dashboard" "npm_downloads" {
  project_id = tostring(posthog_project.web.id)

  name        = "npm downloads"
  description = "Daily downloads of the npm packages the malkron npm user maintains, published by the npm-downloads job."
  pinned      = true
}
