output "dns_managed_zone" {
  description = "Public DNS managed zone ID"
  value       = google_dns_managed_zone.public.name
}

output "name_servers" {
  description = "Name servers for the public managed DNS zone."
  value       = google_dns_managed_zone.public.name_servers
}
