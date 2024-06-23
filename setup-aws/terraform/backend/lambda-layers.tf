module "lambda_layer_node_modules" {
  source                            = "git::https://github.com/koniferous22/tf-modules//aws-lambda-layer?ref=1.0.0"
  aws_lambda_layer_source_directory = "${local.lambda_layers_directory}/nodeModules"
  aws_lambda_layer_name             = "${var.project_name}_lambdaLayer_nodeModules"
  aws_lambda_layer_zip_file         = "${local.zipfiles_directory}/${var.project_name}_lambdaLayer_nodeModules.zip"
  aws_lambda_runtime                = local.lambda_runtime
}

module "lambda_layer_prisma" {
  source                            = "git::https://github.com/koniferous22/tf-modules//aws-lambda-layer?ref=1.0.0"
  aws_lambda_layer_source_directory = "${local.lambda_layers_directory}/prisma"
  aws_lambda_layer_name             = "${var.project_name}_lambdaLayer_prisma"
  aws_lambda_layer_zip_file         = "${local.zipfiles_directory}/${var.project_name}_lambdaLayer_prisma.zip"
  aws_lambda_runtime                = local.lambda_runtime
}

module "lambda_layer_libs" {
  source                            = "git::https://github.com/koniferous22/tf-modules//aws-lambda-layer?ref=1.0.0"
  aws_lambda_layer_source_directory = "${local.lambda_layers_directory}/libs"
  aws_lambda_layer_name             = "${var.project_name}_lambdaLayer_libs"
  aws_lambda_layer_zip_file         = "${local.zipfiles_directory}/${var.project_name}_lambdaLayer_libs.zip"
  aws_lambda_runtime                = local.lambda_runtime
}
