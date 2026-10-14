output "posthog_project_id" {
  description = "ID of the PostHog project."
  value       = local.posthog_project_id
}

output "posthog_project_token" {
  description = "Token of the PostHog project. It's the public write key, which the site ships to every browser."
  value       = local.posthog_project_token
}
