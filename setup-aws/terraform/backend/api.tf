module "api_admin_lambda" {
  source                      = "../modules/lambda"
  lambda_source_code_path     = "${local.project_root}/sourcecode-ts/api/admin/build-serverless"
  lambda_source_code_zip_file = "${local.zipfiles_directory}/${var.project_name}_apiAdmin.zip"
  lambda_function_handler     = "src/apiServerless.handler"
  lambda_function_name        = "${var.project_name}_apiAdmin"
  lambda_function_layer_arns = [
    module.lambda_layer_node_modules.lambda_layer_arn,
    module.lambda_layer_prisma.lambda_layer_arn,
    module.lambda_layer_libs.lambda_layer_arn
  ]
  lambda_runtime          = local.lambda_runtime
  lambda_timeout_seconds  = 10
  iam_execution_role_name = "${var.project_name}_apiAdminExecutionRole"
  lambda_env_variables_from_ssm_parameter_store = {
    CALENDAR_DATABASE_URL        = "/${var.project_name}/${var.environment}/neon/CALENDAR_DATABASE_URL"
    DIRECT_CALENDAR_DATABASE_URL = "/${var.project_name}/${var.environment}/neon/DIRECT_CALENDAR_DATABASE_URL"
    NODE_ENV                     = "/${var.project_name}/${var.environment}/lambda/api/admin/NODE_ENV"
    CALENDAR_API_ADMIN_RUNTIME   = "/${var.project_name}/${var.environment}/lambda/api/admin/CALENDAR_API_ADMIN_RUNTIME"
  }
}

module "api_admin_http_api" {
  source                                  = "../modules/http-api"
  route53_parent_domain_name              = var.route53_parent_domain_name
  route53_api_subdomain_prefix            = "api-admin.${var.project_name}"
  apigateway_api_name                     = "${var.project_name}_apiAdmin"
  apigateway_stage_name                   = var.environment
  apigateway_api_route_authorization_type = "AWS_IAM"
  apigateway_permission_statement_id      = "ApiAdminAllowExecutionFromAPIGateway"
  lambda_function_name                    = module.api_admin_lambda.lambda_function_name
  lambda_invoke_arn                       = module.api_admin_lambda.lambda_invoke_arn
}

module "iam_signaturev4" {
  source                = "../modules/signature-v4"
  api_gateway_api_id    = module.api_admin_http_api.api_gateway_api_id
  api_gateway_api_stage = module.api_admin_http_api.api_gateway_api_stage
  iam_group_name        = "CalendarAdministrators"
  iam_group_policy_name = "ExecuteCalendarAdminApi"
  iam_user_name         = "CalendarAdminUser"
}

module "api_public_lambda" {
  source                      = "../modules/lambda"
  lambda_source_code_path     = "${local.project_root}/sourcecode-ts/api/public/build-serverless"
  lambda_source_code_zip_file = "${local.zipfiles_directory}/${var.project_name}_apiPublic.zip"
  lambda_function_handler     = "src/apiServerless.handler"
  lambda_function_name        = "${var.project_name}_apiPublic"
  lambda_function_layer_arns = [
    module.lambda_layer_node_modules.lambda_layer_arn,
    module.lambda_layer_prisma.lambda_layer_arn,
    module.lambda_layer_libs.lambda_layer_arn
  ]
  lambda_runtime          = local.lambda_runtime
  lambda_timeout_seconds  = 10
  iam_execution_role_name = "${var.project_name}_apiPublicExecutionRole"
  lambda_env_variables_from_ssm_parameter_store = {
    CALENDAR_DATABASE_URL        = "/${var.project_name}/${var.environment}/neon/CALENDAR_DATABASE_URL"
    DIRECT_CALENDAR_DATABASE_URL = "/${var.project_name}/${var.environment}/neon/DIRECT_CALENDAR_DATABASE_URL"
    NODE_ENV                     = "/${var.project_name}/${var.environment}/lambda/api/public/NODE_ENV"
    CALENDAR_API_PUBLIC_RUNTIME  = "/${var.project_name}/${var.environment}/lambda/api/public/CALENDAR_API_PUBLIC_RUNTIME"
    JWT_SECRET                   = "/${var.project_name}/${var.environment}/lambda/api/public/JWT_SECRET"
  }
}

module "api_public_http_api" {
  source                                  = "../modules/http-api"
  route53_parent_domain_name              = var.route53_parent_domain_name
  route53_api_subdomain_prefix            = "api-public.${var.project_name}"
  apigateway_api_name                     = "${var.project_name}_apiPublic"
  apigateway_stage_name                   = var.environment
  apigateway_api_route_authorization_type = "NONE"
  apigateway_permission_statement_id      = "ApiPublicAllowExecutionFromAPIGateway"
  lambda_function_name                    = module.api_public_lambda.lambda_function_name
  lambda_invoke_arn                       = module.api_public_lambda.lambda_invoke_arn
}

