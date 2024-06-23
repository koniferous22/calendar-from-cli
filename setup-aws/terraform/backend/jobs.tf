module "job_prepare_environment" {
  source                          = "git::https://github.com/koniferous22/tf-modules//aws-lambda-function?ref=1.0.0"
  aws_lambda_source_code_path     = "${local.project_root}/sourcecode-ts/jobs/prepare-environment/build-serverless"
  aws_lambda_source_code_zip_file = "${local.zipfiles_directory}/${var.project_name}_jobPrepareEnvironment.zip"
  aws_lambda_function_handler     = "indexLambda.handler"
  aws_lambda_function_name        = "${var.project_name}_jobPrepareEnvironment"
  aws_lambda_function_layer_arns = [
    module.lambda_layer_node_modules.lambda_layer_arn,
    module.lambda_layer_prisma.lambda_layer_arn,
    module.lambda_layer_libs.lambda_layer_arn
  ]
  aws_lambda_runtime          = "nodejs20.x"
  aws_lambda_timeout_seconds  = 3
  aws_iam_execution_role_name = "${var.project_name}_jobPrepareEnvironmentExecutionRole"
  aws_lambda_env_variables_from_ssm_parameter_store = {
    CALENDAR_DATABASE_URL        = "/${var.project_name}/${var.environment}/neon/CALENDAR_DATABASE_URL"
    DIRECT_CALENDAR_DATABASE_URL = "/${var.project_name}/${var.environment}/neon/DIRECT_CALENDAR_DATABASE_URL"
  }
}

module "job_migrate_past" {
  source                          = "git::https://github.com/koniferous22/tf-modules//aws-lambda-function?ref=1.0.0"
  aws_lambda_source_code_path     = "${local.project_root}/sourcecode-ts/jobs/migrate-past/build-serverless"
  aws_lambda_source_code_zip_file = "${local.zipfiles_directory}/${var.project_name}_jobMigratePast.zip"
  aws_lambda_function_handler     = "indexLambda.handler"
  aws_lambda_function_name        = "${var.project_name}_jobMigratePast"
  aws_lambda_function_layer_arns = [
    module.lambda_layer_node_modules.lambda_layer_arn,
    module.lambda_layer_prisma.lambda_layer_arn,
    module.lambda_layer_libs.lambda_layer_arn
  ]
  aws_lambda_runtime          = "nodejs20.x"
  aws_lambda_timeout_seconds  = 10
  aws_iam_execution_role_name = "${var.project_name}_jobMigratePastExecutionRole"
  aws_lambda_env_variables_from_ssm_parameter_store = {
    CALENDAR_DATABASE_URL        = "/${var.project_name}/${var.environment}/neon/CALENDAR_DATABASE_URL"
    DIRECT_CALENDAR_DATABASE_URL = "/${var.project_name}/${var.environment}/neon/DIRECT_CALENDAR_DATABASE_URL"
  }
}

module "job_calendar_cleanup" {
  source                          = "git::https://github.com/koniferous22/tf-modules//aws-lambda-function?ref=1.0.0"
  aws_lambda_source_code_path     = "${local.project_root}/sourcecode-ts/jobs/calendar-cleanup/build-serverless"
  aws_lambda_source_code_zip_file = "${local.zipfiles_directory}/${var.project_name}_jobCalendarCleanup.zip"
  aws_lambda_function_handler     = "indexLambda.handler"
  aws_lambda_function_name        = "${var.project_name}_jobCalendarCleanup"
  aws_lambda_function_layer_arns = [
    module.lambda_layer_node_modules.lambda_layer_arn,
    module.lambda_layer_prisma.lambda_layer_arn,
    module.lambda_layer_libs.lambda_layer_arn
  ]
  aws_lambda_runtime          = "nodejs20.x"
  aws_lambda_timeout_seconds  = 10
  aws_iam_execution_role_name = "${var.project_name}_jobCalendarCleanupExecutionRole"
  aws_lambda_env_variables_from_ssm_parameter_store = {
    CALENDAR_DATABASE_URL        = "/${var.project_name}/${var.environment}/neon/CALENDAR_DATABASE_URL"
    DIRECT_CALENDAR_DATABASE_URL = "/${var.project_name}/${var.environment}/neon/DIRECT_CALENDAR_DATABASE_URL"
  }
}
