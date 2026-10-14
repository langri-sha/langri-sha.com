resource "google_dns_record_set" "tailscale_challenge" {
  name    = "_tailscale-challenge.${local.domain}."
  project = local.org_project_id

  managed_zone = data.google_dns_managed_zone.public.name
  rrdatas      = ["\"v2=W4MjoqiWs1HqG7vmCPUNtccaRJ3i2AJFA65X5oieT7L6\""]
  ttl          = 300
  type         = "TXT"
}
