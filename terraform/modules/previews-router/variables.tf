variable "image" {
  type        = string
  description = "Image the service is created with. Revisions are deployed from CI, so this only ever serves as a placeholder until the first one lands."
}

variable "location" {
  type        = string
  description = "Cloud Run service location."
}

variable "network" {
  type        = string
  description = "Network the service egresses through to reach the origin."
}

variable "previews_service_host" {
  type        = string
  description = "Host of the previews service, without scheme. Tagged revisions are published at <tag>---<host>."
}

variable "project" {
  type        = string
  description = "Project ID for the project where resources are configured."
}

variable "subnetwork" {
  type        = string
  description = "Subnetwork the service egresses through. Requires Private Google Access."
}

variable "iap_oauth2_secrets" {
  default     = null
  description = "Secret Manager secrets holding the OAuth 2.0 client credentials for IAP. Null leaves IAP off and the router out of the URL map. Their versions are added out of band."
  type = object({
    client_id     = string
    client_secret = string
  })
}
