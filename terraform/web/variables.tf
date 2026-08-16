variable "posthog_project_token_version" {
  default     = "latest"
  description = "Version of the posthog-project-token secret to read. Empty skips the read, which the URL map test needs: a mocked provider cannot resolve it at plan time."
  type        = string
}

variable "posthog_proxy_image" {
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
  description = "Image the PostHog proxy service is created with. Revisions are deployed from CI, so this only ever serves as a placeholder until the first one lands."
  type        = string
}

variable "preview_image" {
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
  description = "Image the preview origin service is created with. Revisions are deployed from CI, one per preview, so this only ever serves as a placeholder until the first one lands."
  type        = string
}

variable "preview_router_image" {
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
  description = "Image the preview router service is created with. Revisions are deployed from CI, so this only ever serves as a placeholder until the first one lands."
  type        = string
}

variable "repo_name" {
  default     = "langri-sha.com"
  description = "Name of the GitHub monorepo."
  type        = string
}

variable "repo_owner" {
  default     = "langri-sha"
  description = "Owner of the GitHub monorepo."
  type        = string
}
