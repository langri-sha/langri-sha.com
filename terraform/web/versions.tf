terraform {
  required_version = "1.9.3"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.40.0"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "5.40.0"
    }

    github = {
      source  = "integrations/github"
      version = "6.2.3"
    }
  }
}
