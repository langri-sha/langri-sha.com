terraform {
  required_version = "1.16.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.46.1"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "7.46.1"
    }

    github = {
      source  = "integrations/github"
      version = "6.13.0"
    }

    posthog = {
      source  = "PostHog/posthog"
      version = "1.0.23"
    }
  }
}
