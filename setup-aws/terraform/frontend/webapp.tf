resource "random_id" "s3_bucket_random_suffix" {
  byte_length = 8
}

module "webapp" {
  source                                          = "git::https://github.com/koniferous22/tf-modules//aws-cloudfront-static-website?ref=1.0.0"
  website_dist_root                               = "${local.project_root}/sourcecode-ts/web/dist-serverless"
  aws_route53_parent_domain_name                  = var.route53_parent_domain_name
  aws_route53_webapp_subdomain_prefix             = var.project_name
  aws_s3_website_bucket_name                      = "${var.project_name}-web-app-${random_id.s3_bucket_random_suffix.hex}"
  aws_s3_website_cors_allowed_origins             = [var.public_api_url]
  aws_cloudfront_distribution_default_root_object = "/index.html"
  aws_cloudfront_origin_id                        = "${var.project_name}-cloudfront-dist"
  aws_cloudfront_s3_logs_bucket                   = "${var.project_name}-web-app-${random_id.s3_bucket_random_suffix.hex}-logs"
  aws_cloudfront_s3_logs_prefix                   = var.project_name
  aws_cloudfront_origin_access_control_name       = "${var.project_name}-web-app-cloudfront-OAC"
}
