module "api_admin_lambda" {
  source                          = "git::https://github.com/koniferous22/tf-modules//aws-lambda-function?ref=1.0.0"
  aws_lambda_source_code_path     = "${local.project_root}/sourcecode-ts/api/admin/build-serverless"
  aws_lambda_source_code_zip_file = "${local.zipfiles_directory}/${var.project_name}_apiAdmin.zip"
  aws_lambda_function_handler     = "src/apiServerless.handler"
  aws_lambda_function_name        = "${var.project_name}_apiAdmin"
  aws_lambda_function_layer_arns = [
    module.lambda_layer_node_modules.lambda_layer_arn,
    module.lambda_layer_prisma.lambda_layer_arn,
    module.lambda_layer_libs.lambda_layer_arn
  ]
  aws_lambda_runtime          = local.lambda_runtime
  aws_lambda_timeout_seconds  = 10
  aws_iam_execution_role_name = "${var.project_name}_apiAdminExecutionRole"
  aws_lambda_env_variables_from_ssm_parameter_store = {
    CALENDAR_DATABASE_URL        = "/${var.project_name}/${var.environment}/neon/CALENDAR_DATABASE_URL"
    DIRECT_CALENDAR_DATABASE_URL = "/${var.project_name}/${var.environment}/neon/DIRECT_CALENDAR_DATABASE_URL"
    NODE_ENV                     = "/${var.project_name}/${var.environment}/lambda/api/admin/NODE_ENV"
    CALENDAR_API_ADMIN_RUNTIME   = "/${var.project_name}/${var.environment}/lambda/api/admin/CALENDAR_API_ADMIN_RUNTIME"
  }
}

module "api_admin_http_api" {
  source                                      = "git::https://github.com/koniferous22/tf-modules//aws-http-api?ref=1.0.0"
  aws_route53_parent_domain_name              = var.route53_parent_domain_name
  aws_route53_api_subdomain_prefix            = "api-admin.${var.project_name}"
  aws_apigateway_api_name                     = "${var.project_name}_apiAdmin"
  aws_apigateway_stage_name                   = var.environment
  aws_apigateway_api_route_authorization_type = "AWS_IAM"
  aws_apigateway_permission_statement_id      = "ApiAdminAllowExecutionFromAPIGateway"
  aws_lambda_function_name                    = module.api_admin_lambda.lambda_function_name
  aws_lambda_invoke_arn                       = module.api_admin_lambda.lambda_invoke_arn
}

module "iam_signaturev4" {
  source                    = "git::https://github.com/koniferous22/tf-modules//aws-signature-v4?ref=1.0.0"
  aws_api_gateway_api_id    = module.api_admin_http_api.api_gateway_api_id
  aws_api_gateway_api_stage = module.api_admin_http_api.api_gateway_api_stage
  aws_iam_group_name        = "CalendarAdministrators"
  aws_iam_group_policy_name = "ExecuteCalendarAdminApi"
  aws_iam_user_name         = "CalendarAdminUser"
}

module "api_public_lambda" {
  source                          = "git::https://github.com/koniferous22/tf-modules//aws-lambda-function?ref=1.0.0"
  aws_lambda_source_code_path     = "${local.project_root}/sourcecode-ts/api/public/build-serverless"
  aws_lambda_source_code_zip_file = "${local.zipfiles_directory}/${var.project_name}_apiPublic.zip"
  aws_lambda_function_handler     = "src/apiServerless.handler"
  aws_lambda_function_name        = "${var.project_name}_apiPublic"
  aws_lambda_function_layer_arns = [
    module.lambda_layer_node_modules.lambda_layer_arn,
    module.lambda_layer_prisma.lambda_layer_arn,
    module.lambda_layer_libs.lambda_layer_arn
  ]
  aws_lambda_runtime          = local.lambda_runtime
  aws_lambda_timeout_seconds  = 10
  aws_iam_execution_role_name = "${var.project_name}_apiPublicExecutionRole"
  aws_lambda_env_variables_from_ssm_parameter_store = {
    CALENDAR_DATABASE_URL        = "/${var.project_name}/${var.environment}/neon/CALENDAR_DATABASE_URL"
    DIRECT_CALENDAR_DATABASE_URL = "/${var.project_name}/${var.environment}/neon/DIRECT_CALENDAR_DATABASE_URL"
    NODE_ENV                     = "/${var.project_name}/${var.environment}/lambda/api/public/NODE_ENV"
    CALENDAR_API_PUBLIC_RUNTIME  = "/${var.project_name}/${var.environment}/lambda/api/public/CALENDAR_API_PUBLIC_RUNTIME"
    JWT_SECRET                   = "/${var.project_name}/${var.environment}/lambda/api/public/JWT_SECRET"
  }
}

module "api_public_http_api" {
  source                                      = "git::https://github.com/koniferous22/tf-modules//aws-http-api?ref=1.0.0"
  aws_route53_parent_domain_name              = var.route53_parent_domain_name
  aws_route53_api_subdomain_prefix            = "api-public.${var.project_name}"
  aws_apigateway_api_name                     = "${var.project_name}_apiPublic"
  aws_apigateway_stage_name                   = var.environment
  aws_apigateway_api_route_authorization_type = "NONE"
  aws_apigateway_permission_statement_id      = "ApiPublicAllowExecutionFromAPIGateway"
  aws_lambda_function_name                    = module.api_public_lambda.lambda_function_name
  aws_lambda_invoke_arn                       = module.api_public_lambda.lambda_invoke_arn
}
