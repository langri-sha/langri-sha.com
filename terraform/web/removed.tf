# Forget these without deleting them from PostHog: another workspace manages them now.

removed {
  from = posthog_dashboard.github_api_usage

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_dashboard.github_repositories

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_dashboard.npm_downloads

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_dashboard.npm_releases

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_dashboard_layout.github_api_usage

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_dashboard_layout.github_repositories

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_dashboard_layout.npm_downloads

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_dashboard_layout.npm_releases

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.github_api_cost

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.github_api_durations

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.github_api_rate_limit

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.github_repositories_change

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.github_repositories_referrers

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.github_repositories_runs

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.github_repositories_stars

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.github_repositories_stars_gained

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.github_repositories_visitors

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.npm_downloads_by_package

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.npm_downloads_by_repository

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.npm_downloads_runs

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.npm_downloads_top_packages

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.npm_downloads_weekly

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.npm_releases_cadence

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.npm_releases_pending

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.npm_releases_pending_by_package

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.npm_releases_published

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_insight.npm_releases_runs

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_alert.github_api_budget

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_alert.github_api_slow_query

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_alert.npm_downloads_missed_day

  lifecycle {
    destroy = false
  }
}

removed {
  from = posthog_alert.npm_releases_missed_hour

  lifecycle {
    destroy = false
  }
}
