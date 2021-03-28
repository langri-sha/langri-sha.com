output "billing_account" {
  description = "Billing account, default. Used for most projects."
  value       = module.billing.billing_account
}

output "org_admins" {
  description = "List of users who are assigned to administer the organization."
  value       = module.org.org_admins
}

output "org_billing_admins" {
  description = "List of users who are assigned to administer the billing accounts in the organization."
  value       = module.org.org_billing_admins
}

output "web_folder" {
  description = "Folder where workspace resources are created."
  value       = module.web.folder
}

output "web_service_account_email" {
  description = "Folder where workspace resources are created."
  value       = module.web.service_account_email
}
