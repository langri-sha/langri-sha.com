data "google_organization" "org" {
  domain = var.org_domain
}

resource "google_organization_iam_custom_role" "org_admin" {
  role_id     = "org-admin"
  org_id      = data.google_organization.org.org_id
  title       = "Organization Admins"
  description = "Allows users to manage the organization and create root folders"
  permissions = ["resourcemanager.folders.*", "resourcemanager.organizations.*"]
}
