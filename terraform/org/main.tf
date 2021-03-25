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

  org_admin_members         = var.org_admin_members
  org_billing_admin_members = var.org_billing_admin_members
  org_domain                = var.org_domain
}

module "billing" {
  source = "../modules/billing"

  billing_account = var.billing_account

  depends_on = [
    module.org
  ]
}

module "web" {
  source = "../modules/workspace"

  name = "web"

  billing_account = module.billing.billing_account
  org             = module.org.org_id
}
