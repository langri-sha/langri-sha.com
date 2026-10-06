variable "deployers" {
  default     = []
  description = "Members that deploy new images to the job and act as its runtime identity."
  type        = list(string)
}

variable "image" {
  type        = string
  description = "Image the job is created with. CI deploys the real one, so this only ever serves as a placeholder until the first one lands."
}

variable "location" {
  type        = string
  description = "Cloud Run job and Cloud Scheduler location."
}

variable "name" {
  type        = string
  description = "Cloud Run job name, and the account ID of the service account it runs as."
}

variable "posthog_project_token" {
  type        = string
  description = "PostHog project token the job publishes with."
}

variable "project" {
  type        = string
  description = "Project ID for the project where resources are configured."
}

variable "schedule" {
  type        = string
  description = "When to run the job, as a cron expression in UTC."
}
