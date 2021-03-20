data "google_billing_account" "default" {
  billing_account = var.billing_account
  open = true
}
