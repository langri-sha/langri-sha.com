variable "iap_enabled" {
  default     = false
  description = "Whether IAP protects the preview router. Off until the OAuth client exists and both halves of it have secret versions, because an unprotected router is a worse place for previews than the bucket they are served from today."
  type        = bool
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
