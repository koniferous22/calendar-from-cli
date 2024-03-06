variable "project_name" {
  type        = string
  description = "Project name"
}

variable "environment" {
  type        = string
  description = "Calendar deployment environment (dev|prod)"
}

variable "route53_parent_domain_name" {
  type        = string
  description = "Apex domain of the calendar stack"
}
