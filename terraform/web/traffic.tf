locals {
  certificate_hash = substr(md5(join(",", values(local.host_names))), 0, 4)
  limited_hosts = toset(compact([
    for host in local.hosts :
    contains(keys(local.host_redirects), host) ? "" : host
  ]))
}

resource "google_compute_global_address" "default" {
  name    = "global-address"
  project = module.project["edge"].project_id
}

data "google_dns_managed_zone" "public" {
  name    = local.dns_managed_zone
  project = local.org_project_id
}

resource "google_dns_record_set" "default" {
  for_each = local.host_names

  name    = "${each.value}."
  project = local.org_project_id

  managed_zone = data.google_dns_managed_zone.public.name
  rrdatas      = [google_compute_global_address.default.address]
  ttl          = 300
  type         = "A"
}

resource "google_compute_managed_ssl_certificate" "default" {
  provider = google-beta

  name    = "v1-${local.certificate_hash}-ssl-certificate"
  project = module.project["edge"].project_id

  lifecycle {
    create_before_destroy = true
  }

  managed {
    domains = values(local.host_names)
  }
}

resource "google_compute_backend_bucket" "public" {
  for_each = local.limited_hosts

  name    = "${each.value}-backend-bucket"
  project = module.project["edge"].project_id

  bucket_name = google_storage_bucket.public[each.value].name
  compression_mode = "AUTOMATIC"
  enable_cdn  = true

  custom_response_headers = [
    "Referrer-Policy: no-referrer",
    "Strict-Transport-Security: max-age=31536000; includeSubDomains",
    "X-Content-Type-Options: nosniff",
    "X-Frame-Options: deny",
    "X-XSS-Protection: 1; mode=block"
  ]
}

resource "google_compute_global_forwarding_rule" "http" {
  name    = "http-forwarding-rule"
  project = module.project["edge"].project_id

  ip_address = google_compute_global_address.default.address
  port_range = "80"
  target     = google_compute_target_http_proxy.default.self_link
}


resource "google_compute_global_forwarding_rule" "https" {
  name    = "https-forwarding-rule"
  project = module.project["edge"].project_id

  ip_address = google_compute_global_address.default.address
  port_range = "443"
  target     = google_compute_target_https_proxy.default.self_link
}

resource "google_compute_target_http_proxy" "default" {
  name    = "http-proxy"
  project = module.project["edge"].project_id

  url_map = google_compute_url_map.https_redirect.id
}

resource "google_compute_target_https_proxy" "default" {
  name    = "https-proxy"
  project = module.project["edge"].project_id

  ssl_certificates = [google_compute_managed_ssl_certificate.default.self_link]
  url_map          = google_compute_url_map.default.id
}

resource "google_compute_url_map" "https_redirect" {
  name    = "https-redirect"
  project = module.project["edge"].project_id

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_url_map" "default" {
  name    = "url-map"
  project = module.project["edge"].project_id

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }

  dynamic "host_rule" {
    for_each = local.limited_hosts

    content {
      hosts        = [local.host_names[host_rule.value]]
      path_matcher = host_rule.key
    }
  }

  dynamic "path_matcher" {
    for_each = local.limited_hosts

    content {
      name            = path_matcher.value
      default_service = google_compute_backend_bucket.public[path_matcher.value].self_link
    }
  }
}
