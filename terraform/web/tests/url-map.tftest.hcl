mock_provider "google" {
  mock_resource "google_service_account" {
    defaults = {
      id   = "projects/edge-0000/serviceAccounts/mock-account@edge-0000.iam.gserviceaccount.com"
      name = "projects/edge-0000/serviceAccounts/mock-account@edge-0000.iam.gserviceaccount.com"
    }
  }

  mock_data "google_iam_policy" {
    defaults = {
      policy_data = "{}"
    }
  }
}

mock_provider "google-beta" {}

mock_provider "random" {}

mock_provider "github" {
  mock_data "github_repository" {
    defaults = {
      full_name = "langri-sha/langri-sha.com"
      name      = "langri-sha.com"
    }
  }
}

override_data {
  target = data.terraform_remote_state.org

  values = {
    outputs = {
      admin_members             = ["user:someone@example.com"]
      billing_account           = "000000-000000-000000"
      dns_managed_zone          = "example"
      domain                    = "example.com"
      location                  = "EU"
      org_id                    = "000000000000"
      org_project_id            = "org-0000"
      region                    = "europe-west1"
      web_folder                = "folders/000000000000"
      web_service_account_email = "web@org-0000.iam.gserviceaccount.com"
      zone                      = "europe-west1-b"
    }
  }
}

override_module {
  target = module.project["build"]

  outputs = {
    project_id     = "build-0000"
    project_number = "100000000000"
  }
}

override_module {
  target = module.project["edge"]

  outputs = {
    project_id     = "edge-0000"
    project_number = "200000000000"
  }
}

run "analytics_reach_the_proxy_on_every_host_that_serves_the_site" {
  command = apply

  assert {
    condition = alltrue([
      for host in ["preview", "production"] :
      length([
        for matcher in google_compute_url_map.default.path_matcher :
        matcher
        if matcher.name == host
      ]) == 1
    ])
    error_message = "The production and preview hosts must each have a path matcher of their own."
  }

  assert {
    condition = alltrue([
      for host in ["preview", "production"] :
      setunion([], flatten([
        for matcher in google_compute_url_map.default.path_matcher : [
          for rule in matcher.path_rule :
          rule.paths
          if rule.service == module.posthog_proxy.backend_service
        ]
        if matcher.name == host
      ])) == toset(["/psthg", "/psthg/*"])
    ])
    error_message = "Both /psthg and /psthg/* must reach the proxy on the production and preview hosts. A wildcard alone leaves the bare path on the host's own backend."
  }

  assert {
    condition = alltrue([
      for matcher in google_compute_url_map.default.path_matcher :
      matcher.default_service != module.posthog_proxy.backend_service
    ])
    error_message = "No host may fall back to the proxy: it answers for /psthg and nothing else."
  }

  assert {
    condition = alltrue(flatten([
      for matcher in google_compute_url_map.default.path_matcher : [
        for rule in matcher.path_rule :
        try(length(rule.route_action), 0) == 0 && try(length(rule.url_redirect), 0) == 0
      ]
    ]))
    error_message = "The proxy is mounted at /psthg and strips that prefix itself. A rule that rewrites or redirects the path hands it something it answers with a 404."
  }

  assert {
    condition = alltrue([
      for matcher in google_compute_url_map.default.path_matcher :
      length(matcher.path_rule) == 0
      if !contains(["preview", "production"], matcher.name)
    ])
    error_message = "Hosts that serve no HTML make no analytics requests, and must carry no path rules."
  }
}

run "the_proxy_hosts_are_the_ones_the_site_is_published_on" {
  command = apply

  assert {
    condition = alltrue([
      for rule in google_compute_url_map.default.host_rule :
      contains(rule.hosts, "example.com") ? rule.path_matcher == "production" : true
    ])
    error_message = "The apex must be matched by the production path matcher, which is the one carrying the /psthg rules."
  }

  assert {
    condition = alltrue([
      for rule in google_compute_url_map.default.host_rule :
      contains(rule.hosts, "preview.example.com") ? rule.path_matcher == "preview" : true
    ])
    error_message = "The preview host must be matched by the preview path matcher, which is the one carrying the /psthg rules."
  }

  assert {
    condition = length([
      for rule in google_compute_url_map.default.host_rule :
      rule
      if contains(rule.hosts, "example.com") || contains(rule.hosts, "preview.example.com")
    ]) == 2
    error_message = "Both hosts must have a rule in the URL map. A host without one answers from the map's default, not from its matcher."
  }
}
