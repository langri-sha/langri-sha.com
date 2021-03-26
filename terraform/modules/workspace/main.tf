resource "google_folder" "workspace" {
  display_name = var.name
  parent       = "organizations/${var.org_id}"
}
