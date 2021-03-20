variable "billing_account" {
  type        = string
  description = "Billing account ID, for the default billing account."
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
