module "previews_router" {
  source = "../modules/previews-router"

  image                 = var.preview_router_image
  location              = local.region
  network               = module.vpc["web"].network_name
  previews_service_host = trimprefix(module.previews.service_url, "https://")
  project               = module.project["edge"].project_id
  subnetwork            = module.vpc["web"].subnets["${local.region}/cloud-run"].name
}
