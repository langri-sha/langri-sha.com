locals {
  org_admin_members = [
    for user in split(",", var.org_admin_members)
    : "user:${user}@${data.google_organization.org.domain}"
  ]
  org_billing_admin_members = [
    for user in split(",", var.org_billing_admin_members)
    : "user:${user}@${data.google_organization.org.domain}"
  ]
}

data "google_organization" "org" {
  domain = var.org_domain
}

resource "google_organization_iam_binding" "org_admin_folder_editor" {
  org_id  = data.google_organization.org.org_id
  role    = "roles/resourcemanager.folderEditor"
  members = local.org_admin_members
}

resource "google_organization_iam_binding" "org_billing_admin_billing_creator" {
  org_id  = data.google_organization.org.org_id
  role    = "roles/billing.creator"
  members = local.org_billing_admin_members
}
