resource "random_id" "s3_bucket_random_suffix" {
  byte_length = 8
}

module "webapp" {
  source                                      = "../modules/cloudfront-static-website"
  route53_parent_domain_name                  = var.route53_parent_domain_name
  route53_webapp_subdomain_prefix             = var.project_name
  s3_website_bucket_name                      = "${var.project_name}-web-app-${random_id.s3_bucket_random_suffix.hex}"
  s3_website_cors_allowed_origins             = [var.public_api_url]
  cloudfront_distribution_default_root_object = "/index.html"
  cloudfront_origin_id                        = "${var.project_name}-cloudfront-dist"
  cloudfront_s3_logs_bucket                   = "${var.project_name}-web-app-${random_id.s3_bucket_random_suffix.hex}-logs"
  cloudfront_s3_logs_prefix                   = var.project_name
  cloudfront_origin_access_control_name       = "${var.project_name}-web-app-cloudfront-OAC"
}
