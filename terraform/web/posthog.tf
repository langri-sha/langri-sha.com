locals {
  posthog_host            = "https://eu.posthog.com"
  posthog_organization_id = data.google_secret_manager_secret_version_access.posthog["posthog-organization-id"].secret_data
  posthog_project_id      = data.terraform_remote_state.org.outputs.posthog_projects["web"].id
  posthog_project_token   = data.terraform_remote_state.org.outputs.posthog_projects["web"].token
  posthog_secrets         = data.terraform_remote_state.org.outputs.posthog_secrets
}

provider "google" {
  alias = "org_secrets"

  impersonate_service_account           = local.secrets_service_account_email
  impersonate_service_account_delegates = [local.web_service_account_email]
}

# The principal holds secretAccessor, which reads a version but can't look it up.
data "google_secret_manager_secret_version_access" "posthog" {
  for_each = {
    for name in ["posthog-api-key", "posthog-organization-id"] :
    name => local.posthog_secrets[name]
  }

  project = local.org_project_id
  secret  = basename(each.value)

  provider = google.org_secrets
}

import {
  to = posthog_project.web
  id = nonsensitive("${local.posthog_organization_id}/${module.secrets["posthog-proxy"].secret_data["posthog-project-id"]}")
}

resource "posthog_project" "web" {
  name            = "langri-sha.com"
  organization_id = local.posthog_organization_id
  timezone        = "UTC"

  lifecycle {
    prevent_destroy = true
  }
}
