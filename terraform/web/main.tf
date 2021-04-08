terraform {
  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "langri-sha"

    workspaces {
      name = "web"
    }
  }
}

provider "google" {
  alias = "access_token_resolver"
}

module "access_token_resolver" {
  source = "../modules/access-token-resolver"

  target_service_account = data.terraform_remote_state.org.outputs.web_service_account_email

  providers = {
    google = google.access_token_resolver
  }
}

provider "google" {
  access_token = module.access_token_resolver.access_token
}

provider "google-beta" {
  access_token = module.access_token_resolver.access_token
}

data "terraform_remote_state" "org" {
  backend = "remote"

  config = {
    hostname     = "app.terraform.io"
    organization = "langri-sha"
    workspaces = {
      name = "org"
    }
  }
}
