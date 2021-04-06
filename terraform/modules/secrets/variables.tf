variable "project" {
  type        = string
  description = "The project ID where secret resources are centralized."
}

variable "secrets" {
  type        = list(string)
  description = "Descriptive names of secrets to create."
}

variable "secret_accessors" {
  type        = list(string)
  default     = []
  description = "Service accounts given permission to read secrets."
}

variable "topic" {
  type        = string
  description = "Some descriptive text that will be added to the labels for this set of secrets in the project, e.g. 'cloudbuild'."
}
