terraform {
  required_version = "1.16.2"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "8.3.0"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "8.3.0"
    }

    github = {
      source  = "integrations/github"
      version = "6.13.0"
    }
  }
}
