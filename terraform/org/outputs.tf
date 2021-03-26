output "billing_account" {
  description = "Billing account, default. Used for most projects."
  value       = module.billing.billing_account
}

output "web_folder" {
  description = "Folder where workspace resources are created."
  value       = module.web.folder
}

output "web_service_account_email" {
  description = "Folder where workspace resources are created."
  value       = module.web.service_account_email
}
