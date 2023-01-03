module "project" {
  for_each = local.projects
  source   = "terraform-google-modules/project-factory/google"
  version  = "~> 13.0.0"

  activate_apis           = each.value.activate_apis
  auto_create_network     = false
  billing_account         = local.billing_account
  default_service_account = "deprivilege"
  folder_id               = local.web_folder
  name                    = each.key
  org_id                  = local.org_id
  random_project_id       = "true"
}
