module "previews_router" {
  source = "../modules/previews-router"

  iap_oauth2_secrets = var.iap_enabled ? {
    client_id     = module.secrets["previews-router"].secret_names["previews-iap-oauth2-client-id"]
    client_secret = module.secrets["previews-router"].secret_names["previews-iap-oauth2-client-secret"]
  } : null
  image                 = var.preview_router_image
  location              = local.region
  network               = module.vpc["web"].network_name
  previews_service_host = trimprefix(module.previews.service_url, "https://")
  project               = module.project["edge"].project_id
  subnetwork            = module.vpc["web"].subnets["${local.region}/cloud-run"].name
}
