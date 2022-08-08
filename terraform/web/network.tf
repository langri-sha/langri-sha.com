resource "google_compute_network" "vpc" {
  name    = "web-network"
  project = module.project_edge.project_id

  auto_create_subnetworks         = false
  delete_default_routes_on_create = true
  routing_mode                    = "GLOBAL"
}

resource "google_compute_subnetwork" "subnet" {
  name    = "${google_compute_network.vpc.name}-subnet"
  project = module.project_edge.project_id

  ip_cidr_range            = "10.10.0.0/16"
  network                  = google_compute_network.vpc.name
  private_ip_google_access = true
  region                   = local.region
}
