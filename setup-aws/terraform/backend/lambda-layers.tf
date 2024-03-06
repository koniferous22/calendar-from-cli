module "lambda_layer_node_modules" {
  source                        = "../modules/lambda-layer"
  lambda_layer_source_directory = "${local.lambda_layers_directory}/nodeModules"
  lambda_layer_name             = "${var.project_name}_lambdaLayer_nodeModules"
  lambda_layer_zip_file         = "${local.zipfiles_directory}/${var.project_name}_lambdaLayer_nodeModules.zip"
  lambda_runtime                = local.lambda_runtime
}

module "lambda_layer_prisma" {
  source                        = "../modules/lambda-layer"
  lambda_layer_source_directory = "${local.lambda_layers_directory}/prisma"
  lambda_layer_name             = "${var.project_name}_lambdaLayer_prisma"
  lambda_layer_zip_file         = "${local.zipfiles_directory}/${var.project_name}_lambdaLayer_prisma.zip"
  lambda_runtime                = local.lambda_runtime
}

module "lambda_layer_libs" {
  source                        = "../modules/lambda-layer"
  lambda_layer_source_directory = "${local.lambda_layers_directory}/libs"
  lambda_layer_name             = "${var.project_name}_lambdaLayer_libs"
  lambda_layer_zip_file         = "${local.zipfiles_directory}/${var.project_name}_lambdaLayer_libs.zip"
  lambda_runtime                = local.lambda_runtime
}
