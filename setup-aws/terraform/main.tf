module "backend" {
  source                     = "./backend"
  project_name               = local.project_name
  environment                = var.environment
  route53_parent_domain_name = data.aws_ssm_parameter.calendar_parent_domain_name.value
}

module "frontend" {
  source                     = "./frontend"
  project_name               = local.project_name
  environment                = var.environment
  route53_parent_domain_name = data.aws_ssm_parameter.calendar_parent_domain_name.value
  public_api_url             = module.backend.public_api_domain_name
}
