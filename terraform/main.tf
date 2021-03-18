terraform {
  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "langri-sha"

    workspaces {
      name = "web"
    }
  }
}

module "org" {
  source = "./modules/org"

  org_admin_members         = var.org_admin_members
  org_billing_admin_members = var.org_billing_admin_members
  org_domain                = var.org_domain
}

resource "google_folder" "web" {
  display_name = "web"
  parent       = "organizations/${module.org.org_id}"
}
