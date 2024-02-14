module "github" {
  for_each = local.github_repositories

  source = "github.com/langri-sha/terraform-google-cloud-platform//modules/github?ref=1413c0efa2d3d0e08c0ef8606dfc02f7cf09d3ef"

  project   = each.value.project
  full_name = each.key
}
