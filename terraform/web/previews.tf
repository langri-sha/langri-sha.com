module "previews" {
  source = "../modules/previews"

  deployers = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  image     = var.preview_image
  location  = local.region
  project   = module.project["edge"].project_id
}
