module "secrets" {
  for_each = local.secrets

  source = "github.com/langri-sha/terraform-google-cloud-platform//modules/secrets?ref=v0.15.0"

  project             = each.value.project
  read_secret_version = try(each.value.read_secret_version, {})
  secret_accessors    = try(each.value.secret_accessors, [])
  secrets             = each.value.secrets
  topic               = each.key
}
