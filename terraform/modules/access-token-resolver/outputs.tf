output "access_token" {
  description = "Access token for authorizing Google API requests, if requested."
  value       = data.google_service_account_access_token.service_account_access_token.access_token
}
