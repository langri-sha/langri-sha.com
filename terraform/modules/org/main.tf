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

module "project_org" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 10.2.2"

  name = "organization"

  auto_create_network     = false
  billing_account         = data.google_billing_account.default.billing_account
  default_service_account = "deprivilege"
  org_id                  = data.google_organization.org.org_id
  random_project_id       = "true"

  activate_apis = var.activate_apis
}

resource "google_service_account" "terraform" {
  account_id   = "terraform-org"
  display_name = "Organization Terraform Service Account"
  project      = module.project_org.project_id
}

resource "google_project_iam_member" "terraform_service_account_admin" {
  project = module.project_org.project_id
  role    = "roles/iam.serviceAccountAdmin"
  member  = "serviceAccount:${google_service_account.terraform.email}"
}

resource "google_service_account_iam_binding" "admins_terraform_user" {
  service_account_id = google_service_account.terraform.name
  role               = "roles/iam.serviceAccountUser"
  members            = local.admins
}

resource "google_service_account_iam_binding" "admins_terraform_token_creator" {
  service_account_id = google_service_account.terraform.name
  role               = "roles/iam.serviceAccountTokenCreator"
  members            = local.admins
}

resource "google_organization_iam_binding" "terraform_folder_admin" {
  org_id  = data.google_organization.org.org_id
  role    = "roles/resourcemanager.folderAdmin"
  members = ["serviceAccount:${google_service_account.terraform.email}"]
}

resource "google_organization_iam_binding" "terraform_project_creator" {
  org_id  = data.google_organization.org.org_id
  role    = "roles/resourcemanager.projectCreator"
  members = ["serviceAccount:${google_service_account.terraform.email}"]
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
