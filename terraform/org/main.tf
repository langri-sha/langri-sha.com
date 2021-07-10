terraform {
  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "langri-sha"

    workspaces {
      name = "org"
    }
  }
}

provider "google" {
  alias = "application_default_credentials"
}

provider "google" {
  access_token = module.access_token_resolver.access_token
}

module "access_token_resolver" {
  source = "../modules/access-token-resolver"

  target_service_account = module.terraform_admin.service_account_email

  providers = {
    google = google.application_default_credentials
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
    "dns.googleapis.com",
    "iam.googleapis.com",
    "serviceusage.googleapis.com",
  ]

  providers = {
    google = google.application_default_credentials
  }
}

module "terraform_admin" {
  source = "../modules/terraform-admin"

  billing_account       = module.org.billing_account
  org_id                = module.org.org_id
  project_id            = module.org.project_id
  service_account_users = module.org.admins

  depends_on = [
    module.org
  ]

  providers = {
    google = google.application_default_credentials
  }
}

module "web" {
  source = "../modules/workspace"

  name = "web"

  billing_account = module.org.billing_account
  org_admins      = module.org.admins
  org_id          = module.org.org_id
  org_project_id  = module.org.project_id

  service_account_roles = [
    "roles/billing.projectManager",
    "roles/editor",
    "roles/resourcemanager.folderAdmin",
    "roles/resourcemanager.projectCreator",
    "roles/resourcemanager.projectDeleter",
    "roles/storage.admin",
  ]

  depends_on = [
    module.org,
    module.terraform_admin,
  ]
}
