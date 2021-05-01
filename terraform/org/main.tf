terraform {
  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "langri-sha"

    workspaces {
      name = "org"
    }
  }
}

module "org" {
  source = "../modules/org"

  admin_members         = var.org_admin_members
  billing_account       = var.billing_account
  billing_admin_members = var.org_billing_admin_members
  domain                = var.org_domain

  activate_apis = [
    "cloudbilling.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "serviceusage.googleapis.com",
  ]
}

module "web" {
  source = "../modules/workspace"

  name = "web"

  billing_account = module.org.billing_account
  org_admins      = module.org.admins
  org_id          = module.org.org_id

  activate_apis = [
    "cloudbilling.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "serviceusage.googleapis.com",
  ]

  service_account_roles = [
    "roles/billing.projectManager",
    "roles/editor",
    "roles/resourcemanager.folderAdmin",
    "roles/resourcemanager.projectCreator",
    "roles/resourcemanager.projectDeleter",
    "roles/storage.admin",
  ]

  depends_on = [
    module.org
  ]
}
