resource "google_service_account" "terraform" {
  account_id   = "terraform-org"
  display_name = "Organization Terraform Service Account"
  project      = var.project_id
}

resource "google_service_account_iam_binding" "users_terraform_token_creator" {
  service_account_id = google_service_account.terraform.name
  role               = "roles/iam.serviceAccountTokenCreator"
  members            = var.service_account_users
}

resource "google_service_account_iam_binding" "users_terraform_user" {
  service_account_id = google_service_account.terraform.name
  role               = "roles/iam.serviceAccountUser"
  members            = var.service_account_users
}

resource "google_billing_account_iam_member" "terraform_service_account_billing_user" {
  billing_account_id = var.billing_account
  role               = "roles/billing.user"
  member             = "serviceAccount:${google_service_account.terraform.email}"
}

resource "google_project_iam_member" "terraform_service_account_admin" {
  project = var.project_id
  role    = "roles/iam.serviceAccountAdmin"
  member  = "serviceAccount:${google_service_account.terraform.email}"
}

resource "google_project_iam_member" "terraform_browser" {
  project = var.project_id
  role    = "roles/browser"
  member  = "serviceAccount:${google_service_account.terraform.email}"
}

resource "google_organization_iam_binding" "terraform_folder_admin" {
  org_id  = var.org_id
  role    = "roles/resourcemanager.folderAdmin"
  members = ["serviceAccount:${google_service_account.terraform.email}"]
}

resource "google_organization_iam_binding" "terraform_project_creator" {
  org_id  = var.org_id
  role    = "roles/resourcemanager.projectCreator"
  members = ["serviceAccount:${google_service_account.terraform.email}"]
}

resource "google_organization_iam_binding" "terraform_shared_vpc_admin" {
  org_id  = var.org_id
  role    = "roles/compute.xpnAdmin"
  members = ["serviceAccount:${google_service_account.terraform.email}"]
}
