data "google_project" "org" {
  project_id = local.org_project_id
}

locals {
  # Cloud Run names a secret in another project by that project's number, where
  # the org workspace names it by ID.
  mal_the_kron_secrets = {
    for name, id in data.terraform_remote_state.org.outputs.mal_the_kron_secrets :
    name => replace(id, "projects/${local.org_project_id}/", "projects/${data.google_project.org.number}/")
  }
}

module "npm_releases" {
  source = "../modules/telemetry-job"

  deployers             = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  image                 = var.npm_releases_image
  location              = local.region
  name                  = "npm-releases"
  posthog_project_token = posthog_project.web.api_token
  project               = module.project["edge"].project_id
  schedule              = "7 * * * *"

  secrets = {
    GITHUB_APP_CLIENT_ID   = local.mal_the_kron_secrets["mal-the-kron-client-id"]
    GITHUB_APP_PRIVATE_KEY = local.mal_the_kron_secrets["mal-the-kron-private-key"]
  }
}

resource "posthog_dashboard" "npm_releases" {
  project_id = tostring(posthog_project.web.id)

  name        = "npm releases"
  description = "Changes waiting on the next release of each npm package the malkron npm user maintains, published hourly by the npm-releases job."
  pinned      = true
}

resource "posthog_insight" "npm_releases_pending" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.npm_releases.id]

  name        = "Packages with pending changes"
  description = "Each package's latest snapshot. Pre-release changes count toward the bump they precede. A package has been pending since the first snapshot after its count was last zero."

  query_sql = <<-SQL
    SELECT
      package,
      argMax(repository, timestamp) AS repository,
      argMax(bump, timestamp) AS bump,
      argMax(pending, timestamp) AS pending,
      argMax(major, timestamp) AS major,
      argMax(minor, timestamp) AS minor,
      argMax(patch, timestamp) AS patch,
      argMax(prerelease, timestamp) AS prerelease,
      argMax(none, timestamp) AS none,
      minIf(timestamp, timestamp > last_cleared) AS pending_since
    FROM (
      SELECT
        properties.package AS package,
        properties.repository AS repository,
        properties.bump AS bump,
        toInt(properties.pending_changes) AS pending,
        toInt(properties.major) + toInt(properties.premajor) AS major,
        toInt(properties.minor) + toInt(properties.preminor) AS minor,
        toInt(properties.patch) + toInt(properties.prepatch) AS patch,
        toInt(properties.prerelease) AS prerelease,
        toInt(properties.none) AS none,
        timestamp,
        max(if(toInt(properties.pending_changes) = 0, timestamp, toDateTime('1970-01-01 00:00:00')))
          OVER (PARTITION BY properties.package) AS last_cleared
      FROM events
      WHERE event = 'npm_package_pending_changes'
        AND timestamp >= now() - INTERVAL 90 DAY
    )
    GROUP BY package
    HAVING pending > 0
    ORDER BY pending_since, package
  SQL
}

resource "posthog_insight" "npm_releases_pending_by_package" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.npm_releases.id]

  name = "Pending changes by package"

  query_json = jsonencode({
    kind = "InsightVizNode"
    source = {
      kind = "TrendsQuery"
      series = [{
        kind          = "EventsNode"
        event         = "npm_package_pending_changes"
        math          = "sum"
        math_property = "pending_changes"
      }]
      breakdownFilter = {
        breakdowns      = [{ property = "package", type = "event" }]
        breakdown_limit = 50
      }
      dateRange = { date_from = "-7d" }
      interval  = "hour"
    }
  })
}

resource "posthog_dashboard_layout" "npm_releases" {
  project_id   = tostring(posthog_project.web.id)
  dashboard_id = posthog_dashboard.npm_releases.id

  tiles = [
    {
      insight_id   = posthog_insight.npm_releases_pending.id
      layouts_json = jsonencode({ sm = { x = 0, y = 0, w = 12, h = 8 } })
    },
    {
      insight_id   = posthog_insight.npm_releases_pending_by_package.id
      layouts_json = jsonencode({ sm = { x = 0, y = 8, w = 12, h = 6 } })
    },
  ]
}

resource "posthog_dashboard" "github_api_usage" {
  project_id = tostring(posthog_project.web.id)

  name        = "GitHub API usage"
  description = "What the npm-releases job asks of GitHub's GraphQL API each hour, how long it takes, and the rate limit it draws on."
  pinned      = true
}

resource "posthog_insight" "github_api_cost" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.github_api_usage.id]

  name = "GitHub query cost per hour"

  query_json = jsonencode({
    kind = "InsightVizNode"
    source = {
      kind = "TrendsQuery"
      series = [{
        kind          = "EventsNode"
        event         = "npm_releases_run"
        math          = "sum"
        math_property = "github_query_cost"
      }]
      dateRange = { date_from = "-14d" }
      interval  = "hour"
    }
  })
}

resource "posthog_insight" "github_api_rate_limit" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.github_api_usage.id]

  name        = "GitHub rate limit"
  description = "The rate limit as each run left it. Runs as the mal-the-kron App share its budget with everything else the App does."

  query_json = jsonencode({
    kind = "InsightVizNode"
    source = {
      kind = "TrendsQuery"
      series = [
        {
          kind          = "EventsNode"
          event         = "npm_releases_run"
          custom_name   = "Used"
          math          = "max"
          math_property = "github_rate_limit_used"
        },
        {
          kind          = "EventsNode"
          event         = "npm_releases_run"
          custom_name   = "Remaining"
          math          = "min"
          math_property = "github_rate_limit_remaining"
        },
        {
          kind          = "EventsNode"
          event         = "npm_releases_run"
          custom_name   = "Limit"
          math          = "max"
          math_property = "github_rate_limit"
        },
      ]
      dateRange = { date_from = "-14d" }
      interval  = "hour"
    }
  })
}

resource "posthog_insight" "github_api_durations" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.github_api_usage.id]

  name        = "npm-releases durations"
  description = "The slowest of each run's GitHub queries, which GitHub cuts off at 10 seconds, and the whole run."

  query_json = jsonencode({
    kind = "InsightVizNode"
    source = {
      kind = "TrendsQuery"
      series = [
        {
          kind          = "EventsNode"
          event         = "npm_releases_run"
          custom_name   = "Slowest GitHub query"
          math          = "max"
          math_property = "github_slowest_query_ms"
        },
        {
          kind          = "EventsNode"
          event         = "npm_releases_run"
          custom_name   = "Run"
          math          = "max"
          math_property = "duration_ms"
        },
      ]
      trendsFilter = { aggregationAxisFormat = "duration_ms" }
      dateRange    = { date_from = "-14d" }
      interval     = "hour"
    }
  })
}

resource "posthog_dashboard_layout" "github_api_usage" {
  project_id   = tostring(posthog_project.web.id)
  dashboard_id = posthog_dashboard.github_api_usage.id

  tiles = [
    {
      insight_id   = posthog_insight.github_api_rate_limit.id
      layouts_json = jsonencode({ sm = { x = 0, y = 0, w = 12, h = 6 } })
    },
    {
      insight_id   = posthog_insight.github_api_cost.id
      layouts_json = jsonencode({ sm = { x = 0, y = 6, w = 6, h = 5 } })
    },
    {
      insight_id   = posthog_insight.github_api_durations.id
      layouts_json = jsonencode({ sm = { x = 6, y = 6, w = 6, h = 5 } })
    },
  ]
}

resource "posthog_insight" "npm_releases_runs" {
  project_id = tostring(posthog_project.web.id)

  name = "npm releases job runs per hour"

  query_json = jsonencode({
    kind = "InsightVizNode"
    source = {
      kind = "TrendsQuery"
      series = [{
        kind  = "EventsNode"
        event = "npm_releases_run"
        math  = "total"
      }]
      dateRange = { date_from = "-48h" }
      interval  = "hour"
    }
  })
}

resource "posthog_alert" "npm_releases_missed_hour" {
  project_id = tostring(posthog_project.web.id)
  insight    = posthog_insight.npm_releases_runs.id

  name             = "npm releases job missed an hour"
  subscribed_users = [tonumber(module.secrets["posthog"].secret_data["posthog-user-id"])]

  # Hourly alerts check the last completed hour, which the run at :07 has long
  # recorded itself in by then.
  calculation_interval = "hourly"
  series_index         = 0
  condition_type       = "absolute_value"
  threshold_type       = "absolute"
  threshold_lower      = 1
}
