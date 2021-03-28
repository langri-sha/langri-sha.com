output "org_id" {
  description = "The Organization ID."
  value       = data.google_organization.org.org_id
}

output "org_admins" {
  description = "List of users who are assigned to administer the organization."
  value       = local.org_admins
}

output "org_billing_admins" {
  description = "List of users who are assigned to administer the billing accounts in the organization."
  value       = local.org_billing_admins
}
