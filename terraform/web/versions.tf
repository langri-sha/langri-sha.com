terraform {
  required_version = "1.16.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "8.6.0"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "8.6.0"
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
