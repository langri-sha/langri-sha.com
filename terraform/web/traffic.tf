resource "google_compute_global_address" "default" {
  name    = "global-address"
  project = module.project_edge.project_id
}

resource "google_dns_managed_zone" "default" {
  name     = "langri-sha"
  dns_name = "${data.terraform_remote_state.org.outputs.org_domain}."
  project  = module.project_edge.project_id
}
