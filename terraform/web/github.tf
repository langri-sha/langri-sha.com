module "github" {
  for_each = local.github_repositories

  source = "github.com/langri-sha/terraform-google-cloud-platform//modules/github?ref=v0.6.0"

  name              = each.key
  project           = each.value.project

  actions_variables = try(each.value.actions_variables, null)
  environments      = each.value.environments
}
