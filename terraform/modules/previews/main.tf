resource "google_service_account" "previews" {
  account_id   = "web-previews"
  display_name = "Web previews"
  description  = "Runtime identity of the preview origin service. It serves files baked into its own image and holds no roles."
  project      = var.project
}
