variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "environment" {
  type        = string
  description = "Calendar deployment environment (dev|prod)"
}
