module "secrets" {
  for_each = local.secrets

  source = "github.com/langri-sha/terraform-google-cloud-platform//modules/secrets?ref=v0.12.0"

  project = each.value.project
  secrets = each.value.secrets
  topic   = each.key
}
