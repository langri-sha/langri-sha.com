module "vpc" {
  for_each = local.vpc
  source   = "terraform-google-modules/network/google"
  version  = "~> 13.0"

  network_name     = each.key
  project_id       = each.value.project
  routing_mode     = each.value.routing_mode
  secondary_ranges = each.value.secondary_ranges
  subnets          = each.value.subnets
}
