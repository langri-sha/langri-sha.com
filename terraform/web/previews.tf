module "previews" {
  source = "../modules/previews"

  image    = var.preview_image
  location = local.region
  project  = module.project["edge"].project_id
}
