terraform {
  required_version = "1.7.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.84.0"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "4.31.0"
    }
  }
}
