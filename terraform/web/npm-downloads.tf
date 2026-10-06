module "npm_downloads" {
  source = "../modules/npm-downloads"

  deployers             = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  image                 = var.npm_downloads_image
  location              = local.region
  posthog_project_token = posthog_project.web.api_token
  project               = module.project["edge"].project_id
  schedule              = "17 12 * * *"
}

resource "posthog_dashboard" "npm_downloads" {
  project_id = tostring(posthog_project.web.id)

  name        = "npm downloads"
  description = "Daily downloads of the npm packages the malkron npm user maintains, published by the npm-downloads job."
  pinned      = true
}

locals {
  # The job publishes the day before yesterday at 12:17 UTC. Ending the charts
  # three days back keeps the newest day from reading as a drop to zero every
  # morning until then.
  npm_downloads_charted_until = "-3d"
}

resource "posthog_insight" "npm_downloads_by_package" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.npm_downloads.id]

  name = "npm downloads by package"

  query_json = jsonencode({
    kind = "InsightVizNode"
    source = {
      kind = "TrendsQuery"
      series = [{
        kind          = "EventsNode"
        event         = "npm_package_downloads"
        math          = "sum"
        math_property = "downloads"
      }]
      breakdownFilter = {
        breakdowns      = [{ property = "package", type = "event" }]
        breakdown_limit = 50
      }
      dateRange = { date_from = "-90d", date_to = local.npm_downloads_charted_until }
      interval  = "day"
    }
  })
}
