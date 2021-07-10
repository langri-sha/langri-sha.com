variable "dns_admins" {
  description = "List of service account emails that will be assigned as DNS admins in the related project."
  type        = list(string)
}

variable "domain" {
  description = "Domain for which resources are created."
  type        = string
}

variable "project_id" {
  description = "Project where resources belong to."
  type        = string
}

variable "site_verifications" {
  description = "Comma-separated list of DNS-based domain ownership verifications."
  type        = list(string)
}
