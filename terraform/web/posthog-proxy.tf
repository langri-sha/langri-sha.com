module "posthog_proxy" {
  source = "../modules/posthog-proxy"

  deployers = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  image     = var.posthog_proxy_image
  location  = local.region
  project   = module.project["edge"].project_id
}
