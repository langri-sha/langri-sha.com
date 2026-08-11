module "previews_router" {
  source = "../modules/previews-router"

  iap_oauth2_client_id     = var.iap_oauth2_client_id
  iap_oauth2_client_secret = var.iap_oauth2_client_secret
  image                    = var.preview_router_image
  location                 = local.region
  members                  = local.admin_members
  network                  = module.vpc["web"].network_name
  previews_service_host    = trimprefix(module.previews.service_url, "https://")
  project                  = module.project["edge"].project_id
  subnetwork               = module.vpc["web"].subnets["${local.region}/cloud-run"].name
}
