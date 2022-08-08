output "admin_members" {
  description = "List of memberss who are assigned to administer the organization."
  value       = local.admin_members
}

output "billing_members" {
  description = "List of members who are assigned to administer the billing accounts in the organization."
  value       = local.billing_members
}

output "billing_account" {
  description = "Billing account, default. Used for most projects."
  value       = data.google_billing_account.default.id
}

output "domain" {
  description = "Organization domain, for which resources are created."
  value       = data.google_organization.org.domain
}

output "location"{
  description = "Default location to use for Google Cloud services."
  value       = var.location
}

output "region" {
  description = "Default region to use for Google Cloud services."
  value       = var.region
}

output "org_id" {
  description = "The Organization ID."
  value       = data.google_organization.org.org_id
}

output "project_id" {
  description = "Main organization project ID."
  value       = module.project_org.project_id
}

output "zone" {
  description = "Default zone to use for Google Cloud services."
  value       = var.zone
}
