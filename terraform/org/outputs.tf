output "billing_account" {
  description = "Billing account, default. Used for most projects."
  value       = module.billing.billing_account
}

output "org_admins" {
  description = "List of users who are assigned to administer the organization."
  value       = module.org.admins
}

output "org_billing_admins" {
  description = "List of users who are assigned to administer the billing accounts in the organization."
  value       = module.org.billing_admins
}

output "org_id" {
  description = "The Organization ID."
  value       = module.org.org_id
}

output "web_folder" {
  description = "Folder where workspace resources are created."
  value       = module.web.folder
}

output "web_service_account_email" {
  description = "Email of the Terrraform service account managing the workspace."
  value       = module.web.service_account_email
}
