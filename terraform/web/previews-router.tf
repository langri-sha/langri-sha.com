module "previews_router" {
  source = "../modules/previews-router"

  deployers = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  iap_oauth2_secrets = {
    client_id     = module.secrets["previews-router"].secret_names["previews-iap-oauth2-client-id"]
    client_secret = module.secrets["previews-router"].secret_names["previews-iap-oauth2-client-secret"]
  }
  image                 = var.preview_router_image
  location              = local.region
  members               = local.admin_members
  network               = module.vpc["web"].network_name
  previews_service_host = trimprefix(module.previews.service_url, "https://")
  project               = module.project["edge"].project_id
  subnetwork            = module.vpc["web"].subnets["${local.region}/cloud-run"].name
}
