terraform {
  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "langri-sha"

    workspaces {
      name = "web"
    }
  }
}
