variable "org_domain" {
  type        = string
  description = "Organization domain, for which resources are created."
}

variable "org_admin_members" {
  type        = string
  description = "Comma-separated list of users who are assigned the org-admin role."
}
