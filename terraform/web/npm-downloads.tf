module "npm_downloads" {
  source = "../modules/telemetry-job"

  deployers             = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  image                 = var.npm_downloads_image
  location              = local.region
  name                  = "npm-downloads"
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

resource "posthog_insight" "npm_downloads_by_repository" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.npm_downloads.id]

  name = "npm downloads by repository"

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
        breakdowns = [{ property = "repository", type = "event" }]
      }
      dateRange = { date_from = "-90d", date_to = local.npm_downloads_charted_until }
      interval  = "day"
    }
  })
}

resource "posthog_insight" "npm_downloads_top_packages" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.npm_downloads.id]

  name = "Top npm packages, last 30 days"

  query_sql = <<-SQL
    SELECT
      properties.package AS package,
      any(properties.repository) AS repository,
      sum(toInt(properties.downloads)) AS downloads
    FROM events
    WHERE event = 'npm_package_downloads'
      AND timestamp >= toStartOfDay(now()) - INTERVAL 32 DAY
      AND timestamp < toStartOfDay(now()) - INTERVAL 2 DAY
    GROUP BY package
    ORDER BY downloads DESC
  SQL
}

resource "posthog_insight" "npm_downloads_weekly" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.npm_downloads.id]

  name = "npm downloads per week"

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
      dateRange = { date_from = "-180d", date_to = local.npm_downloads_charted_until }
      interval  = "week"
    }
  })
}

resource "posthog_dashboard_layout" "npm_downloads" {
  project_id   = tostring(posthog_project.web.id)
  dashboard_id = posthog_dashboard.npm_downloads.id

  tiles = [
    {
      insight_id   = posthog_insight.npm_downloads_by_package.id
      layouts_json = jsonencode({ sm = { x = 0, y = 0, w = 12, h = 6 } })
    },
    {
      insight_id   = posthog_insight.npm_downloads_by_repository.id
      layouts_json = jsonencode({ sm = { x = 0, y = 6, w = 6, h = 5 } })
    },
    {
      insight_id   = posthog_insight.npm_downloads_weekly.id
      layouts_json = jsonencode({ sm = { x = 6, y = 6, w = 6, h = 5 } })
    },
    {
      insight_id   = posthog_insight.npm_downloads_top_packages.id
      layouts_json = jsonencode({ sm = { x = 0, y = 11, w = 12, h = 8 } })
    },
  ]
}

resource "posthog_insight" "npm_downloads_runs" {
  project_id = tostring(posthog_project.web.id)

  name = "npm downloads job runs per day"

  query_json = jsonencode({
    kind = "InsightVizNode"
    source = {
      kind = "TrendsQuery"
      series = [{
        kind  = "EventsNode"
        event = "npm_downloads_published"
        math  = "total"
      }]
      dateRange = { date_from = "-14d" }
      interval  = "day"
    }
  })
}

resource "posthog_alert" "npm_downloads_missed_day" {
  project_id = tostring(posthog_project.web.id)
  insight    = posthog_insight.npm_downloads_runs.id

  name             = "npm downloads job missed a day"
  subscribed_users = [tonumber(module.secrets["posthog"].secret_data["posthog-user-id"])]

  # Daily alerts check the last completed day, which the 12:17 UTC run has
  # long recorded itself in by then.
  calculation_interval = "daily"
  series_index         = 0
  condition_type       = "absolute_value"
  threshold_type       = "absolute"
  threshold_lower      = 1
}
