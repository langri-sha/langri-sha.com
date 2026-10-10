output "edge_project_id" {
  description = "ID of the project holding the PostHog secrets."
  value       = module.project["edge"].project_id
}

output "posthog_project_id" {
  description = "ID of the PostHog project."
  value       = tostring(posthog_project.web.id)
}

output "posthog_project_token" {
  description = "Token of the PostHog project. It's the public write key, which the site ships to every browser."
  value       = nonsensitive(posthog_project.web.api_token)
}
