output "admins" {
  description = "List of users who are assigned to administer the organization."
  value       = local.admins
}

output "billing_account" {
  description = "Billing account, default. Used for most projects."
  value       = data.google_billing_account.default.id
}

output "billing_admins" {
  description = "List of users who are assigned to administer the billing accounts in the organization."
  value       = local.billing_admins
}

output "domain" {
  description = "Organization domain, for which resources are created."
  value       = data.google_organization.org.domain
}

output "org_id" {
  description = "The Organization ID."
  value       = data.google_organization.org.org_id
}

output "project_id" {
  description = "Main organization project ID."
  value       = module.project_org.project_id
}
