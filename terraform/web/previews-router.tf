module "previews_router" {
  source = "../modules/previews-router"

  project = module.project["edge"].project_id
}
