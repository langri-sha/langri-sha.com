resource "google_folder" "workspace" {
  display_name = var.name
  parent       = "organizations/${var.org_id}"
}

resource "google_service_account" "terraform" {
  account_id   = "terraform-${var.name}"
  display_name = "${var.name} Workspace Terraform Service Account"
  project      = var.org_project_id
}

resource "google_billing_account_iam_member" "terraform_service_account_billing_user" {
  billing_account_id = var.billing_account
  role               = "roles/billing.user"
  member             = "serviceAccount:${google_service_account.terraform.email}"
}

resource "google_folder_iam_member" "terraform_service_account_workspace" {
  for_each = toset(var.service_account_roles)

  folder = google_folder.workspace.name
  role   = each.value
  member = "serviceAccount:${google_service_account.terraform.email}"
}

resource "google_service_account_iam_binding" "admins_terraform_user" {
  service_account_id = google_service_account.terraform.name
  role               = "roles/iam.serviceAccountUser"
  members            = var.admin_members
}

resource "google_service_account_iam_binding" "admins_terraform_token_creator" {
  service_account_id = google_service_account.terraform.name
  role               = "roles/iam.serviceAccountTokenCreator"
  members            = var.admin_members
}
