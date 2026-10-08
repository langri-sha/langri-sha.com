module "secrets" {
  for_each = local.secrets

  source = "github.com/langri-sha/terraform-google-cloud-platform//modules/secrets?ref=v0.13.0"

  project             = each.value.project
  read_secret_version = try(each.value.read_secret_version, {})
  secrets             = each.value.secrets
  topic               = each.key
}

data "google_project" "org" {
  project_id = local.org_project_id
}

locals {
  # Cloud Run names a secret in another project by that project's number, where
  # the org workspace names it by ID.
  mal_the_kron_secrets = {
    for name, id in data.terraform_remote_state.org.outputs.mal_the_kron_secrets :
    name => replace(id, "projects/${local.org_project_id}/", "projects/${data.google_project.org.number}/")
  }
}
