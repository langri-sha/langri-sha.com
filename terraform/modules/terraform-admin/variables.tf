variable "billing_account" {
  description = "Billing account, default. Used for most projects."
  type        = string
}

variable "org_id" {
  description = "The Organization ID."
  type        = string
}

variable "project_id" {
  description = "Main organization project ID."
  type        = string
}

variable "service_account_users" {
  description = "List of users who are assigned to access the Terraform service account."
  type        = list(string)
}
