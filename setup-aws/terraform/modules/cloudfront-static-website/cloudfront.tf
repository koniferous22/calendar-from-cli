resource "aws_cloudfront_origin_access_control" "website_origin_access_control" {
  name                              = var.cloudfront_origin_access_control_name
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "website_distribution" {
  origin {
    domain_name              = aws_s3_bucket.website_s3_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.website_origin_access_control.id
    origin_id                = var.cloudfront_origin_id
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = var.cloudfront_distribution_default_root_object

  logging_config {
    include_cookies = false
    bucket          = "${aws_s3_bucket.cloudfront_s3_logs_bucket.bucket}.s3.amazonaws.com"
    prefix          = var.cloudfront_s3_logs_prefix
  }

  aliases = [local.website_full_domain]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = var.cloudfront_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "allow-all"
    min_ttl                = 0
    default_ttl            = 120
    max_ttl                = 300
  }

  price_class = "PriceClass_200"

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cloudfront_cert.arn
    ssl_support_method  = "sni-only"
  }

  custom_error_response {
    error_code    = 403
    response_code = 200
    // Routing errors are handled by react-router-dom
    response_page_path = var.cloudfront_distribution_default_root_object
  }
}