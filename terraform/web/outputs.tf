output "dns_zone_name_servers" {
  value       = google_dns_managed_zone.default.name_servers
  description = "Name servers for the default managed DNS zone."
}
