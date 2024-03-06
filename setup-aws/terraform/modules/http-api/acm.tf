resource "aws_acm_certificate" "api_cert" {
  domain_name       = local.api_full_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "api_cert_validation" {
  certificate_arn         = aws_acm_certificate.api_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.route53_acm_dns_validation_record : record.fqdn]
}
