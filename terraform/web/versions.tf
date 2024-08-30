terraform {
  required_version = "1.9.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.43.1"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "5.43.1"
    }

    github = {
      source  = "integrations/github"
      version = "6.2.3"
    }
  }
}
