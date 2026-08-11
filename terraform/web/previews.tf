module "previews" {
  source = "../modules/previews"

  project = module.project["edge"].project_id
}
