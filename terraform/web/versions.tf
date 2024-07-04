terraform {
  required_version = "1.9.1"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.36.0"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "5.36.0"
    }

    github = {
      source  = "integrations/github"
      version = "6.2.2"
    }
  }
}
