variable "billing_account" {
  type        = string
  description = "Billing account ID, for the default billing account."
}

variable "mx_records" {
  description = "Comma-separated list of MX record destinations and their priorities."
  type        = string
}

variable "org_admin_members" {
  type        = string
  description = "Comma-separated list of users who are assigned to administer the organization."
}

variable "org_billing_admin_members" {
  type        = string
  description = "Comma-separated list of users who are assigned to administer billing accounts in the organization."
}

variable "org_domain" {
  type        = string
  description = "Organization domain, for which resources are created."
}
variable "site_verifications" {
  description = "Comma-separated list of DNS-based domain ownership verifications."
  type        = string
}
