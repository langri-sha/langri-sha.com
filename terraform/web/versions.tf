terraform {
  required_version = "1.8.1"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.25.0"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "5.25.0"
    }

    github = {
      source  = "integrations/github"
      version = "6.2.1"
    }
  }
}
