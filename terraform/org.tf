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

resource "google_organization_iam_member" "org_admin_folder_editor" {
  for_each = toset(local.org_admin_members)

  org_id  = data.google_organization.org.org_id
  role    = "roles/resourcemanager.folderEditor"
  member  = each.value
}

resource "google_organization_iam_member" "org_billing_admin_billing_creator" {
  for_each = toset(local.org_billing_admin_members)

  org_id  = data.google_organization.org.org_id
  role    = "roles/billing.creator"
  member  = each.value
}
