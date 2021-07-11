resource "google_dns_managed_zone" "public" {
  dns_name = "${var.domain}."
  name     = "public"
  project  = var.project_id
}

resource "google_dns_record_set" "mx" {
  name    = google_dns_managed_zone.public.dns_name
  project = var.project_id

  managed_zone = google_dns_managed_zone.public.name
  rrdatas      = [for destination, priority in var.mx_records : "${priority} ${destination}"]
  ttl          = 3600
  type         = "MX"
}

resource "google_dns_record_set" "site_verifications" {
  count = length(var.site_verifications) > 0 ? 1 : 0

  name    = google_dns_managed_zone.public.dns_name
  project = var.project_id

  managed_zone = google_dns_managed_zone.public.name
  rrdatas      = var.site_verifications
  ttl          = 300
  type         = "TXT"
}

resource "google_project_iam_member" "service_account_dns_admin" {
  for_each = toset(var.dns_admins)

  project = var.project_id
  role    = "roles/dns.admin"
  member  = "serviceAccount:${each.value}"
}
