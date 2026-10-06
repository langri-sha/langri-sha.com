variable "npm_downloads_image" {
  default     = "us-docker.pkg.dev/cloudrun/container/job"
  description = "Image the npm downloads job is created with. CI deploys the real one, so this only ever serves as a placeholder until the first one lands."
  type        = string
}

variable "posthog_secrets_version" {
  default     = "latest"
  description = "Version of the posthog-api-key, posthog-organization-id and posthog-user-id secrets to read. Empty skips the read, for the first apply, before the secrets have versions."
  type        = string
}

variable "posthog_project_id_version" {
  default     = "latest"
  description = "Version of the posthog-project-id secret to read. Empty skips the read."
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

variable "voice_editor_image" {
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
  description = "Image the voice editor origin service is created with. Revisions are deployed from CI, so this only ever serves as a placeholder until the first one lands."
  type        = string
}
