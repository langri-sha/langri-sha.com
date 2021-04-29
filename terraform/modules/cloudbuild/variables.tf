variable "project_id" {
  description = "Project where resources belong to."
  type        = string
}

variable "repo_name" {
  default     = "langri-sha.com"
  description = "Name of the GitHub monorepo."
  type        = string
}

variable "repo_owner" {
  default     = "langri-sha"
  description = "Owner of the GitHub monorepo."
  type        = string
}

variable "triggers" {
  description = "Build triggers."
  type = list(object({
    description   = string
    filename      = string
    name          = string
    substitutions = optional(map(string))

    included_files = optional(list(string))

    pull_request = optional(object({
      branch = optional(string)
    }))

    push = optional(object({
      branch = optional(string)
      tag    = optional(string)
    }))
  }))
}
