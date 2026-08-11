resource "google_service_account" "previews_router" {
  account_id   = "preview-router"
  display_name = "Preview router"
  description  = "Runtime identity of the preview router. It proxies to the origin service and holds no roles."
  project      = var.project
}
