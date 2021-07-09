output "service_account_email" {
  description = "Email of the Terrraform service account managing the organization."
  value       = google_service_account.terraform.email
}
