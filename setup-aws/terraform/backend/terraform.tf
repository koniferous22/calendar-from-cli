terraform {
  required_version = "~> 1.6"
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

locals {
  project_root            = "${path.module}/../../.."
  zipfiles_directory      = "${path.module}/../../.deploy"
  lambda_layers_directory = "${path.module}/../../.lambda-layers"
  lambda_runtime          = "nodejs20.x"
}