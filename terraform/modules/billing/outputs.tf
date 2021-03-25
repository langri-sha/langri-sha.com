output "billing_account" {
  description = "Billing account, default. Used for most projects."
  value       = data.google_billing_account.default.name
}
