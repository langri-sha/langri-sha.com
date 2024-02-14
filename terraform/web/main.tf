terraform {
  cloud {
    organization = "langri-sha"

    workspaces {
      name = "web"
    }
  }
}

locals {
  admin_members             = data.terraform_remote_state.org.outputs.admin_members
  billing_account           = data.terraform_remote_state.org.outputs.billing_account
  dns_managed_zone          = data.terraform_remote_state.org.outputs.dns_managed_zone
  domain                    = data.terraform_remote_state.org.outputs.domain
  location                  = data.terraform_remote_state.org.outputs.location
  region                    = data.terraform_remote_state.org.outputs.region
  org_id                    = data.terraform_remote_state.org.outputs.org_id
  org_project_id            = data.terraform_remote_state.org.outputs.org_project_id
  web_folder                = data.terraform_remote_state.org.outputs.web_folder
  web_service_account_email = data.terraform_remote_state.org.outputs.web_service_account_email
  zone                      = data.terraform_remote_state.org.outputs.zone
}

locals {
  artifact_registry_repositories = {
    "docker" = {
      description = "Main Docker repository"
      format      = "DOCKER"
    },
  }

  github_repositories = {}

  hosts = [
    "www",
    "production",
    "production-assets",
    "preview",
    "preview-assets",
  ]

  host_names = {
    "www"               = "www.${local.domain}",
    "production"        = local.domain,
    "production-assets" = "assets.${local.domain}",
    "preview"           = "preview.${local.domain}",
    "preview-assets"    = "assets.preview.${local.domain}",
  }

  host_redirects = {
    "www" = "production"
  }

  host_urls = {
    "www"               = "https://${local.host_names["www"]}",
    "production"        = "https://${local.host_names["production"]}",
    "production-assets" = "https://${local.host_names["production-assets"]}",
    "preview"           = "https://${local.host_names["preview"]}",
    "preview-assets"    = "https://${local.host_names["preview-assets"]}",
  }

  host_cors_origins = {
    "www"               = [local.host_urls["www"]],
    "production"        = [local.host_urls["production"]],
    "production-assets" = [local.host_urls["production"]],
    "preview"           = [local.host_urls["preview"]],
    "preview-assets"    = [local.host_urls["preview"]],
  }

  projects = {
    build = {
      activate_apis = [
        "artifactregistry.googleapis.com",
        "cloudbuild.googleapis.com",
        "compute.googleapis.com",
        "containerregistry.googleapis.com",
        "iam.googleapis.com",
      ]

      iam_members = {
        "roles/iam.workloadIdentityPoolAdmin" = [
          "serviceAccount:${local.web_service_account_email}",
        ]
      }
    }

    edge = {
      activate_apis = [
        "compute.googleapis.com",
        "dns.googleapis.com",
        "iap.googleapis.com",
      ]

      iam_members = {
        "roles/iam.roleAdmin" = [
          "serviceAccount:${local.web_service_account_email}",
        ]
      }
    }
  }

  triggers = [
    {
      description = "Terraform Pull Request"
      filename    = "terraform/cloudbuild.yaml"
      name        = "terraform-pull-request"

      included_files = ["docker-compose.yml", "terraform/**"]

      pull_request = {
        branch = ".*"
      }
    },

    {
      description = "Workspace Pull Request"
      filename    = "cloudbuild.yaml"
      name        = "workspace-pull-request"

      substitutions = {
        "_PREVIEW_ASSETS_BUCKET"    = google_storage_bucket.public["preview-assets"].name
        "_PREVIEW_ASSETS_URL"       = local.host_urls["preview-assets"]
        "_PREVIEW_BUCKET"           = google_storage_bucket.public["preview"].name
        "_PREVIEW_URL"              = local.host_urls["preview"]
        "_PRODUCTION_ASSETS_BUCKET" = google_storage_bucket.public["production-assets"].name
        "_PRODUCTION_ASSETS_URL"    = local.host_urls["production-assets"]
        "_PRODUCTION_BUCKET"        = google_storage_bucket.public["production"].name
        "_PRODUCTION_URL"           = local.host_urls["production"]
      }

      ignored_files = ["terraform/**"]

      pull_request = {
        branch = ".*"
      }
    },

    {
      description = "Workspace Push"
      filename    = "cloudbuild.yaml"
      name        = "workspace-push"

      substitutions = {
        "_PREVIEW_ASSETS_BUCKET"    = google_storage_bucket.public["preview-assets"].name
        "_PREVIEW_ASSETS_URL"       = local.host_urls["preview-assets"]
        "_PREVIEW_BUCKET"           = google_storage_bucket.public["preview"].name
        "_PREVIEW_URL"              = local.host_urls["preview"]
        "_PRODUCTION_ASSETS_BUCKET" = google_storage_bucket.public["production-assets"].name
        "_PRODUCTION_ASSETS_URL"    = local.host_urls["production-assets"]
        "_PRODUCTION_BUCKET"        = google_storage_bucket.public["production"].name
        "_PRODUCTION_URL"           = local.host_urls["production"]
      }

      ignored_files = ["terraform/**"]

      push = {
        branch = "main"
      }
    },

    {
      description = "Workspace Release"
      filename    = "cloudbuild.yaml"
      name        = "workspace-release"

      substitutions = {
        "_PREVIEW_ASSETS_BUCKET"    = google_storage_bucket.public["preview-assets"].name
        "_PREVIEW_ASSETS_URL"       = local.host_urls["preview-assets"]
        "_PREVIEW_BUCKET"           = google_storage_bucket.public["preview"].name
        "_PREVIEW_URL"              = local.host_urls["preview"]
        "_PRODUCTION_ASSETS_BUCKET" = google_storage_bucket.public["production-assets"].name
        "_PRODUCTION_ASSETS_URL"    = local.host_urls["production-assets"]
        "_PRODUCTION_BUCKET"        = google_storage_bucket.public["production"].name
        "_PRODUCTION_URL"           = local.host_urls["production"]
      }

      ignored_files = ["terraform/**"]

      push = {
        tag = ".*"
      }
    }
  ]

  vpc = {
    web = {
      project      = module.project["edge"].project_id
      routing_mode = "GLOBAL"

      subnets = [
        {
          description   = "Subnet for GKE"
          subnet_ip     = "172.16.0.0/22"
          subnet_name   = "gke"
          subnet_region = local.region
        },
      ]

      secondary_ranges = {
        gke = [
          {
            range_name    = "services"
            ip_cidr_range = "192.168.0.0/20"
          },
          {
            range_name    = "pods"
            ip_cidr_range = "192.168.64.0/18"
          },
        ]
      }
    }
  }
}


provider "google" {
  impersonate_service_account = local.web_service_account_email
}

provider "google-beta" {
  impersonate_service_account = local.web_service_account_email
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
