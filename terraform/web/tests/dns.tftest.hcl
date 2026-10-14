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
      admin_members                  = ["user:someone@example.com"]
      billing_account                = "000000-000000-000000"
      dns_managed_zone               = "example"
      domain                         = "example.com"
      internal_service_account_email = "internal@org-0000.iam.gserviceaccount.com"
      location                       = "EU"
      org_id                         = "000000000000"
      org_project_id                 = "org-0000"
      posthog_projects = {
        web = {
          id    = "1"
          token = "phc_test"
        }
      }
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

run "tailscale_challenge_is_a_quoted_txt_record_below_the_apex" {
  command = plan

  assert {
    condition     = google_dns_record_set.tailscale_challenge.name == "_tailscale-challenge.example.com."
    error_message = "The Tailscale challenge must sit on the _tailscale-challenge label under the domain, fully qualified."
  }

  assert {
    condition     = google_dns_record_set.tailscale_challenge.type == "TXT"
    error_message = "The Tailscale challenge is a TXT record."
  }

  assert {
    condition     = google_dns_record_set.tailscale_challenge.rrdatas == tolist(["\"v2=W4MjoqiWs1HqG7vmCPUNtccaRJ3i2AJFA65X5oieT7L6\""])
    error_message = "The Tailscale challenge value must be a single double-quoted string."
  }

  assert {
    condition     = google_dns_record_set.tailscale_challenge.managed_zone == "example"
    error_message = "The Tailscale challenge belongs in the public managed zone the org exports."
  }

  assert {
    condition     = google_dns_record_set.tailscale_challenge.project == "org-0000"
    error_message = "The Tailscale challenge belongs in the org project that owns the zone."
  }
}
