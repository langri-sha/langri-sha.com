data "google_service_account_access_token" "service_account_access_token" {
  provider = google

  lifetime               = "300s"
  scopes                 = ["cloud-platform", "userinfo-email"]
  target_service_account = var.target_service_account
}
