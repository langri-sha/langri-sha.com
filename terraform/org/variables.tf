variable "admin_members" {
  type        = string
  description = "Comma-separated list of members who are assigned to administer the organization."
}

variable "billing_members" {
  type        = string
  description = "Comma-separated list of members who are assigned to administer billing accounts in the organization."
}

variable "billing_account" {
  type        = string
  description = "Billing account ID, for the default billing account."
}

variable "mx_records" {
  description = "Comma-separated list of MX record destinations and their priorities."
  type        = string
}

variable "domain" {
  type        = string
  description = "Organization domain, for which resources are created."
}

variable "location" {
  description = "Default location to use for Google Cloud services."
  type        = string
}

variable "region" {
  description = "Default region to use for Google Cloud services."
  type        = string
}

variable "site_verifications" {
  description = "Comma-separated list of DNS-based domain ownership verifications."
  type        = string
}
