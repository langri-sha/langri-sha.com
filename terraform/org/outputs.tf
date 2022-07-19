output "admin_members" {
  description = "List of members who are assigned to administer the organization."
  value       = module.org.admin_members
}

output "billing_members" {
  description = "List of members who are assigned to administer the billing accounts in the organization."
  value       = module.org.billing_members
}

output "billing_account" {
  description = "Billing account, default. Used for most projects."
  value       = module.org.billing_account
}

output "dns_managed_zone" {
  description = "Public DNS managed zone name."
  value       = module.public_dns.dns_managed_zone
}

output "dns_zone_name_servers" {
  description = "Name servers for the public managed DNS zone."
  value       = module.public_dns.name_servers
}

output "domain" {
  description = "Organization domain, for which resources are created."
  value       = module.org.domain
}

output "org_id" {
  description = "The Organization ID."
  value       = module.org.org_id
}

output "org_project_id" {
  description = "Main organization project ID."
  value       = module.org.project_id
}

output "web_folder" {
  description = "Folder where workspace resources are created."
  value       = module.web.folder
}

output "web_service_account_email" {
  description = "Email of the Terrraform service account managing the workspace."
  value       = module.web.service_account_email
}
