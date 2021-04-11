resource "google_compute_global_address" "default" {
  name    = "global-address"
  project = module.project_edge.project_id
}
