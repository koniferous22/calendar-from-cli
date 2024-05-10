data "aws_ssm_parameter" "calendar_parent_domain_name" {
  name = "/${local.project_name}/${var.environment}/route53/PARENT_DOMAIN"
}
