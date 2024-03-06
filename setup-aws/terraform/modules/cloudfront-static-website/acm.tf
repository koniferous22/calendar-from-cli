resource "aws_acm_certificate" "cloudfront_cert" {
  // Custom provider instance required, as ACM Certificates for Cloudfront have to be located in us-east-1 region
  provider          = aws.us_east_1
  domain_name       = local.website_full_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "cloudfront_cert_validation" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cloudfront_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.route53_acm_dns_validation_record : record.fqdn]
}

