module "previews" {
  source = "../modules/previews"

  deployers = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  image     = var.preview_image
  location  = local.region
  name      = "web-previews"
  project   = module.project["edge"].project_id
}

module "voice_editor" {
  source = "../modules/previews"

  deployers = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  image     = var.voice_editor_image
  location  = local.region
  name      = "voice-editor"
  project   = module.project["edge"].project_id
}
