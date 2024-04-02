module "project" {
  for_each = local.projects
  source   = "terraform-google-modules/project-factory/google"
  version  = "~> 13.1.0"

  activate_apis           = each.value.activate_apis
  auto_create_network     = false
  billing_account         = local.billing_account
  default_service_account = "deprivilege"
  folder_id               = local.web_folder
  name                    = each.key
  org_id                  = local.org_id
  random_project_id       = "true"
}

resource "google_project_iam_binding" "project_iam_binding" {
  for_each = merge(flatten([
    for name, project in local.projects : {
      for role, members in try(project.iam_members, {}) : "${name}-${role}" => {
        members = members
        project = name
        role    = role
      }
    }
  ])...)

  members = each.value.members
  project = module.project[each.value.project].project_id
  role    = each.value.role
}
