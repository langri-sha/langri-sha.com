module "github" {
  for_each = local.github_repositories

  source = "github.com/langri-sha/terraform-google-cloud-platform//modules/github?ref=v0.5.0"

  actions_variables = try(each.value.actions_variables, null)
  name              = each.key
  project           = each.value.project
}