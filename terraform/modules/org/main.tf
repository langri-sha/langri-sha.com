locals {
  admins = [
    for user in split(",", var.admin_members)
    : "user:${user}@${data.google_organization.org.domain}"
  ]
  billing_admins = [
    for user in split(",", var.billing_admin_members)
    : "user:${user}@${data.google_organization.org.domain}"
  ]
}

data "google_organization" "org" {
  domain = var.domain
}

resource "google_organization_iam_binding" "org_admin_folder_creator" {
  org_id  = data.google_organization.org.org_id
  role    = "roles/resourcemanager.folderCreator"
  members = local.admins
}

resource "google_organization_iam_binding" "org_admin_project_creator" {
  org_id  = data.google_organization.org.org_id
  role    = "roles/resourcemanager.projectCreator"
  members = local.admins
}

resource "google_organization_iam_binding" "org_billing_admin_billing_creator" {
  org_id  = data.google_organization.org.org_id
  role    = "roles/billing.creator"
  members = local.billing_admins
}

resource "google_organization_iam_binding" "org_admin_billing_admin_service_usage_viewer" {
  org_id  = data.google_organization.org.org_id
  role    = "roles/serviceusage.serviceUsageViewer"
  members = local.billing_admins
}

data "google_billing_account" "default" {
  billing_account = var.billing_account
  open = true

  depends_on = [
    google_organization_iam_binding.org_billing_admin_billing_creator
  ]
}
