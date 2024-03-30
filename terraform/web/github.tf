module "github" {
  for_each = local.github_repositories

  source = "github.com/langri-sha/terraform-google-cloud-platform//modules/github?ref=v0.3.0"

  name    = each.key
  project = each.value.project
}
