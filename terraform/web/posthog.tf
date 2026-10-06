locals {
  posthog_host            = "https://eu.posthog.com"
  posthog_organization_id = try(module.secrets["posthog"].secret_data["posthog-organization-id"], null)
}
