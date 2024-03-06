terraform {
  required_version = "~> 1.6"
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

locals {
  api_full_domain = "${var.route53_api_subdomain_prefix}.${var.route53_parent_domain_name}"
}
