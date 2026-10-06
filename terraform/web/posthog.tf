locals {
  posthog_host            = "https://eu.posthog.com"
  posthog_organization_id = try(module.secrets["posthog"].secret_data["posthog-organization-id"], null)
}

import {
  to = posthog_project.web
  id = nonsensitive("${local.posthog_organization_id}/${module.secrets["posthog-proxy"].secret_data["posthog-project-id"]}")
}

resource "posthog_project" "web" {
  name            = "Default project"
  organization_id = local.posthog_organization_id
  timezone        = "UTC"

  lifecycle {
    prevent_destroy = true
  }
}
