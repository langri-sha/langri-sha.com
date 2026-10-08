module "github_repositories" {
  source = "../modules/telemetry-job"

  deployers             = ["serviceAccount:${module.github["langri-sha.com"].service_account.email}"]
  image                 = var.github_repositories_image
  location              = local.region
  name                  = "github-repositories"
  posthog_project_token = posthog_project.web.api_token
  project               = module.project["edge"].project_id
  schedule              = "37 14 * * *"

  secrets = {
    GITHUB_APP_CLIENT_ID   = local.mal_the_kron_secrets["mal-the-kron-client-id"]
    GITHUB_APP_PRIVATE_KEY = local.mal_the_kron_secrets["mal-the-kron-private-key"]
  }
}

resource "posthog_dashboard" "github_repositories" {
  project_id = tostring(posthog_project.web.id)

  name        = "GitHub repositories"
  description = "Which of the public repositories langri-sha owns are getting popular: their visitors, where they come from, and their stars, from the daily github-repositories job. Unique visitors are the signal, since clones are mostly CI and Renovate."
  pinned      = true
}

locals {
  # The job sends the day before yesterday at 14:37 UTC. Ending the charts three
  # days back keeps the newest day from reading as a drop until then.
  github_traffic_charted_until = "-3d"
}

resource "posthog_insight" "github_repositories_visitors" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.github_repositories.id]

  name        = "Unique visitors per week by repository"
  description = "Each day's unique visitors, summed by week, so someone visiting on several days counts on each. A repository with one visitor a day is usually its owner."

  query_json = jsonencode({
    kind = "InsightVizNode"
    source = {
      kind = "TrendsQuery"
      series = [{
        kind          = "EventsNode"
        event         = "github_repository_traffic"
        math          = "sum"
        math_property = "unique_visitors"
      }]
      breakdownFilter = {
        breakdowns      = [{ property = "repository", type = "event" }]
        breakdown_limit = 50
      }
      dateRange = { date_from = "-26w", date_to = local.github_traffic_charted_until }
      interval  = "week"
    }
  })
}

resource "posthog_insight" "github_repositories_change" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.github_repositories.id]

  name        = "Largest change in unique visitors"
  description = "Each repository's unique visitors over the last 14 days the job has sent against the 14 before, summed by day."

  query_sql = <<-SQL
    SELECT
      properties.repository AS repository,
      sumIf(ifNull(toInt(properties.unique_visitors), 0), timestamp >= toStartOfDay(now()) - INTERVAL 16 DAY) AS last_14_days,
      sumIf(ifNull(toInt(properties.unique_visitors), 0), timestamp < toStartOfDay(now()) - INTERVAL 16 DAY) AS previous_14_days,
      last_14_days - previous_14_days AS change
    FROM events
    WHERE event = 'github_repository_traffic'
      AND timestamp >= toStartOfDay(now()) - INTERVAL 30 DAY
      AND timestamp < toStartOfDay(now()) - INTERVAL 2 DAY
    GROUP BY repository
    HAVING last_14_days + previous_14_days > 0
    ORDER BY change DESC, last_14_days DESC
  SQL
}

resource "posthog_insight" "github_repositories_referrers" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.github_repositories.id]

  name        = "Top referrers"
  description = "Where each repository's visitors came from over the 14 days GitHub keeps, from its latest snapshot of its 10 top referrers."

  query_sql = <<-SQL
    SELECT
      repository,
      JSONExtractString(entry, 'referrer') AS referrer,
      JSONExtractInt(entry, 'views') AS views,
      JSONExtractInt(entry, 'unique_visitors') AS unique_visitors
    FROM (
      SELECT
        properties.repository AS repository,
        argMax(JSONExtractRaw(properties, 'referrers'), timestamp) AS referrers
      FROM events
      WHERE event = 'github_repository_referrers'
        AND timestamp >= now() - INTERVAL 7 DAY
      GROUP BY repository
    )
    ARRAY JOIN JSONExtractArrayRaw(referrers) AS entry
    ORDER BY unique_visitors DESC, views DESC
    LIMIT 50
  SQL
}

locals {
  # Leaves out the owner's own stars, and the burst one account gave forks and
  # repositories alike in the same second on 2023-03-08.
  github_stars_counted = "properties.self != 'true' AND toDate(timestamp) != toDate('2023-03-08')"
}

resource "posthog_insight" "github_repositories_stars" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.github_repositories.id]

  name        = "Stars over time by repository"
  description = "Stars given, adding up since the first, apart from the owner's own and the burst on 2023-03-08. Stars taken back still count: GitHub keeps no record of them."

  query_json = jsonencode({
    kind = "InsightVizNode"
    source = {
      kind = "TrendsQuery"
      series = [{
        kind       = "EventsNode"
        event      = "github_repository_starred"
        math       = "total"
        properties = [{ type = "hogql", key = local.github_stars_counted }]
      }]
      breakdownFilter = {
        breakdowns      = [{ property = "repository", type = "event" }]
        breakdown_limit = 50
      }
      trendsFilter = { display = "ActionsLineGraphCumulative" }
      dateRange    = { date_from = "all" }
      interval     = "month"
    }
  })
}

resource "posthog_insight" "github_repositories_stars_gained" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.github_repositories.id]

  name        = "Stars gained in the last 90 days"
  description = "Each star given in the last 90 days, apart from the owner's own, newest first."

  query_sql = <<-SQL
    SELECT
      timestamp AS starred,
      properties.repository AS repository,
      properties.stargazer AS stargazer
    FROM events
    WHERE event = 'github_repository_starred'
      AND timestamp >= now() - INTERVAL 90 DAY
      AND ${local.github_stars_counted}
    ORDER BY timestamp DESC
  SQL
}

resource "posthog_insight" "github_repositories_runs" {
  project_id    = tostring(posthog_project.web.id)
  dashboard_ids = [posthog_dashboard.github_repositories.id]

  name        = "github-repositories job runs per day"
  description = "A day without a run is a day of traffic lost once GitHub's 14 days pass it by."

  query_json = jsonencode({
    kind = "InsightVizNode"
    source = {
      kind = "TrendsQuery"
      series = [{
        kind  = "EventsNode"
        event = "github_repositories_run"
        math  = "total"
      }]
      dateRange = { date_from = "-14d" }
      interval  = "day"
    }
  })
}

resource "posthog_dashboard_layout" "github_repositories" {
  project_id   = tostring(posthog_project.web.id)
  dashboard_id = posthog_dashboard.github_repositories.id

  tiles = [
    {
      insight_id   = posthog_insight.github_repositories_visitors.id
      layouts_json = jsonencode({ sm = { x = 0, y = 0, w = 12, h = 6 } })
    },
    {
      insight_id   = posthog_insight.github_repositories_change.id
      layouts_json = jsonencode({ sm = { x = 0, y = 6, w = 6, h = 8 } })
    },
    {
      insight_id   = posthog_insight.github_repositories_referrers.id
      layouts_json = jsonencode({ sm = { x = 6, y = 6, w = 6, h = 8 } })
    },
    {
      insight_id   = posthog_insight.github_repositories_stars.id
      layouts_json = jsonencode({ sm = { x = 0, y = 14, w = 6, h = 6 } })
    },
    {
      insight_id   = posthog_insight.github_repositories_stars_gained.id
      layouts_json = jsonencode({ sm = { x = 6, y = 14, w = 6, h = 6 } })
    },
    {
      insight_id   = posthog_insight.github_repositories_runs.id
      layouts_json = jsonencode({ sm = { x = 0, y = 20, w = 12, h = 4 } })
    },
  ]
}
