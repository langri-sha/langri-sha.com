terraform {
  required_version = "1.16.4"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "8.5.0"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "8.5.0"
    }

    github = {
      source  = "integrations/github"
      version = "6.13.0"
    }
  }
}
