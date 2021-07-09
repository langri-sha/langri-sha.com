output "billing_account" {
  description = "Billing account, default. Used for most projects."
  value       = module.org.billing_account
}

output "org_admins" {
  description = "List of users who are assigned to administer the organization."
  value       = module.org.admins
}

output "org_billing_admins" {
  description = "List of users who are assigned to administer the billing accounts in the organization."
  value       = module.org.billing_admins
}

output "org_domain" {
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

output "site_verifications" {
  description = "List of DNS-based domain ownership verifications."
  value       = compact(split(",", var.site_verifications))
}

output "web_folder" {
  description = "Folder where workspace resources are created."
  value       = module.web.folder
}

output "web_service_account_email" {
  description = "Email of the Terrraform service account managing the workspace."
  value       = module.web.service_account_email
}
