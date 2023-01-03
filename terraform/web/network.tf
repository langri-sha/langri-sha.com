resource "google_compute_network" "vpc" {
  name    = "web-network"
  project = module.project["edge"].project_id

  auto_create_subnetworks         = false
  delete_default_routes_on_create = true
  routing_mode                    = "GLOBAL"
}

resource "google_compute_subnetwork" "subnet" {
  name    = "${google_compute_network.vpc.name}-subnet"
  project = module.project["edge"].project_id

  ip_cidr_range            = "10.10.0.0/16"
  network                  = google_compute_network.vpc.name
  private_ip_google_access = true
  region                   = local.region
}

resource "google_compute_route" "egress_internet" {
  name    = "egress-internet"
  project = module.project["edge"].project_id

  dest_range       = "0.0.0.0/0"
  network          = google_compute_network.vpc.name
  next_hop_gateway = "default-internet-gateway"
}

resource "google_compute_router" "router" {
  name    = "${google_compute_network.vpc.name}-router"
  project = module.project["edge"].project_id

  network = google_compute_network.vpc.name
  region  = google_compute_subnetwork.subnet.region
}

resource "google_compute_router_nat" "nat" {
  name    = "${google_compute_subnetwork.subnet.name}-nat"
  project = module.project["edge"].project_id

  nat_ip_allocate_option             = "AUTO_ONLY"
  region                             = google_compute_router.router.region
  router                             = google_compute_router.router.name
  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"

  subnetwork {
    name                    = google_compute_subnetwork.subnet.name
    source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
  }

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}
