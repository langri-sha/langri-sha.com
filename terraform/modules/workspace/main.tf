resource "google_folder" "workspace" {
  display_name = var.name
  parent       = "organizations/${var.org_id}"
}

module "tf_admin" {
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

resource "google_service_account" "terraform" {
  account_id   = "terraform"
  display_name = "${var.name} Workspace Terraform Service Account"
  project      = module.tf_admin.project_id
}

resource "google_billing_account_iam_member" "terraform_service_account_billing_user" {
  billing_account_id = var.billing_account
  role               = "roles/billing.user"
  member             = "serviceAccount:${google_service_account.terraform.email}"
}

resource "google_folder_iam_member" "terraform_service_account_workspace_folder_admin" {
  folder      = google_folder.workspace.name
  role        = "roles/resourcemanager.folderAdmin"
  member      = "serviceAccount:${google_service_account.terraform.email}"
}

resource "google_folder_iam_member" "terraform_service_account_workspace_project_creator" {
  folder      = google_folder.workspace.name
  role        = "roles/resourcemanager.projectCreator"
  member      = "serviceAccount:${google_service_account.terraform.email}"
}

resource "google_folder_iam_member" "terraform_service_account_workspace_project_deleter" {
  folder      = google_folder.workspace.name
  role        = "roles/resourcemanager.projectDeleter"
  member      = "serviceAccount:${google_service_account.terraform.email}"
}

resource "google_folder_iam_member" "terraform_service_account_workspace_editor" {
  folder      = google_folder.workspace.name
  role        = "roles/editor"
  member      = "serviceAccount:${google_service_account.terraform.email}"
}

resource "google_service_account_iam_binding" "admins_terraform_user" {
  service_account_id = google_service_account.terraform.name
  role               = "roles/iam.serviceAccountUser"
  members            = var.org_admins
}

resource "google_service_account_iam_binding" "admins_terraform_token_creator" {
  service_account_id = google_service_account.terraform.name
  role               = "roles/iam.serviceAccountTokenCreator"
  members            = var.org_admins
}
