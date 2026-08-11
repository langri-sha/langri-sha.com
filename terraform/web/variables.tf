variable "preview_image" {
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
  description = "Image the preview origin service is created with. Revisions are deployed from CI, one per preview, so this only ever serves as a placeholder until the first one lands."
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
