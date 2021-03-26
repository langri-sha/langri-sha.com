resource "google_folder" "workspace" {
  display_name = var.name
  parent       = "organizations/${var.org_id}"
}

module "project" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 10.2.2"

  name = "tf-admin"

  auto_create_network     = false
  billing_account         = var.billing_account
  default_service_account = "deprivilege"
  folder_id               = google_folder.workspace.id
  org_id                  = var.org_id
  random_project_id       = "true"
}
