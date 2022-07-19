variable "admin_members" {
  type        = list(string)
  description = "Members are assigned to administer the organization."
}

variable "billing_account" {
  type        = string
  description = "Billing account ID, for the default billing account."
}

variable "name" {
  type        = string
  description = "Workspace name. Should be unique in the organization."
}

variable "org_id" {
  type        = string
  description = "Organization ID, where resources are created."
}

variable "org_project_id" {
  description = "Main organization project ID."
  type        = string
}

variable "service_account_roles" {
  type        = list(string)
  description = "Roles to grant the Terraform service account on the workspace folder."
}
