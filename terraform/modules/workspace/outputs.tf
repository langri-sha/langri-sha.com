output "folder" {
  description = "Folder where workspace resources are created."
  value       = google_folder.workspace.name
}

output "service_account_email" {
  description = "Email of the Terrraform service account managing the workspace."
  value       = google_service_account.terraform.email
}
