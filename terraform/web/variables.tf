variable "iap_oauth2_client_id" {
  default     = ""
  description = "OAuth 2.0 client ID for IAP on the preview router. Empty leaves the router out of the URL map, because an unprotected router is a worse place for previews than the bucket they are served from today."
  type        = string
}

variable "iap_oauth2_client_secret" {
  default     = ""
  description = "OAuth 2.0 client secret for IAP on the preview router."
  sensitive   = true
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
