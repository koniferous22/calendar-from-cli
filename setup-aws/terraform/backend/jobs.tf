module "job_prepare_environment" {
  source                      = "../modules/lambda"
  lambda_source_code_path     = "${local.project_root}/sourcecode-ts/jobs/prepare-environment/build-serverless"
  lambda_source_code_zip_file = "${local.zipfiles_directory}/${var.project_name}_jobPrepareEnvironment.zip"
  lambda_function_handler     = "indexLambda.handler"
  lambda_function_name        = "${var.project_name}_jobPrepareEnvironment"
  lambda_function_layer_arns = [
    module.lambda_layer_node_modules.lambda_layer_arn,
    module.lambda_layer_prisma.lambda_layer_arn,
    module.lambda_layer_libs.lambda_layer_arn
  ]
  lambda_runtime          = "nodejs20.x"
  lambda_timeout_seconds  = 3
  iam_execution_role_name = "${var.project_name}_jobPrepareEnvironmentExecutionRole"
  lambda_env_variables_from_ssm_parameter_store = {
    CALENDAR_DATABASE_URL        = "/${var.project_name}/${var.environment}/neon/CALENDAR_DATABASE_URL"
    DIRECT_CALENDAR_DATABASE_URL = "/${var.project_name}/${var.environment}/neon/DIRECT_CALENDAR_DATABASE_URL"
  }
}

module "job_migrate_past" {
  source                      = "../modules/lambda"
  lambda_source_code_path     = "${local.project_root}/sourcecode-ts/jobs/migrate-past/build-serverless"
  lambda_source_code_zip_file = "${local.zipfiles_directory}/${var.project_name}_jobMigratePast.zip"
  lambda_function_handler     = "indexLambda.handler"
  lambda_function_name        = "${var.project_name}_jobMigratePast"
  lambda_function_layer_arns = [
    module.lambda_layer_node_modules.lambda_layer_arn,
    module.lambda_layer_prisma.lambda_layer_arn,
    module.lambda_layer_libs.lambda_layer_arn
  ]
  lambda_runtime          = "nodejs20.x"
  lambda_timeout_seconds  = 10
  iam_execution_role_name = "${var.project_name}_jobMigratePastExecutionRole"
  lambda_env_variables_from_ssm_parameter_store = {
    CALENDAR_DATABASE_URL        = "/${var.project_name}/${var.environment}/neon/CALENDAR_DATABASE_URL"
    DIRECT_CALENDAR_DATABASE_URL = "/${var.project_name}/${var.environment}/neon/DIRECT_CALENDAR_DATABASE_URL"
  }
}

module "job_calendar_cleanup" {
  source                      = "../modules/lambda"
  lambda_source_code_path     = "${local.project_root}/sourcecode-ts/jobs/calendar-cleanup/build-serverless"
  lambda_source_code_zip_file = "${local.zipfiles_directory}/${var.project_name}_jobCalendarCleanup.zip"
  lambda_function_handler     = "indexLambda.handler"
  lambda_function_name        = "${var.project_name}_jobCalendarCleanup"
  lambda_function_layer_arns = [
    module.lambda_layer_node_modules.lambda_layer_arn,
    module.lambda_layer_prisma.lambda_layer_arn,
    module.lambda_layer_libs.lambda_layer_arn
  ]
  lambda_runtime          = "nodejs20.x"
  lambda_timeout_seconds  = 10
  iam_execution_role_name = "${var.project_name}_jobCalendarCleanupExecutionRole"
  lambda_env_variables_from_ssm_parameter_store = {
    CALENDAR_DATABASE_URL        = "/${var.project_name}/${var.environment}/neon/CALENDAR_DATABASE_URL"
    DIRECT_CALENDAR_DATABASE_URL = "/${var.project_name}/${var.environment}/neon/DIRECT_CALENDAR_DATABASE_URL"
  }
}
