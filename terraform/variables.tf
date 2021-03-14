variable "org_admin_members" {
  type        = string
  description = "Comma-separated list of users who are assigned to administer the organization."
}

variable "org_domain" {
  type        = string
  description = "Organization domain, for which resources are created."
}
