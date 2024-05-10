terraform {
  required_version = "~> 1.8"
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
  backend "s3" {
    key = "calendar/dev/terraform.tfstate"
  }
}

locals {
  project_name = "calendar"
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      project     = local.project_name
      environment = var.environment
    }
  }
}
