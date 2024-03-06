data "aws_ssm_parameter" "calendar_parent_domain_name" {
  name = "/${local.project_name}/${var.environment}/api-gateway/PARENT_DOMAIN"
}
