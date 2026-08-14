terraform {
  required_version = "1.15.8"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.44.0"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "7.44.0"
    }

    github = {
      source  = "integrations/github"
      version = "6.13.0"
    }
  }
}
