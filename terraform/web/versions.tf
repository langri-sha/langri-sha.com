terraform {
  required_version = "1.3.6"

  required_providers {
    github = {
      source  = "integrations/github"
      version = "6.0.0-rc2"
    }

    google = {
      source  = "hashicorp/google"
      version = "4.31.0"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "4.31.0"
    }
  }
}
