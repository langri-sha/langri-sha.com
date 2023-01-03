module "iap_bastion" {
  source  = "terraform-google-modules/bastion-host/google"
  version = "~> 5.0.0"

  project = module.project["edge"].project_id
  zone    = local.zone
  network = google_compute_network.vpc.self_link
  subnet  = google_compute_subnetwork.subnet.self_link

  members = concat(
    local.admin_members,
    ["serviceAccount:${local.web_service_account_email}"]
  )
}
