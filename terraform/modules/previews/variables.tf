variable "image" {
  type        = string
  description = "Image the service is created with. Revisions are deployed from CI, one per preview, so this only ever serves as a placeholder until the first one lands."
}

variable "location" {
  type        = string
  description = "Cloud Run service location."
}

variable "project" {
  type        = string
  description = "Project ID for the project where resources are configured."
}
