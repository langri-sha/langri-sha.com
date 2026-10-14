locals {
  posthog_project_id    = data.terraform_remote_state.org.outputs.posthog_projects["web"].id
  posthog_project_token = data.terraform_remote_state.org.outputs.posthog_projects["web"].token
}
