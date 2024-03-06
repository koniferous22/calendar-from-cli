data "archive_file" "lambda_source_code" {
  type        = "zip"
  source_dir  = var.lambda_source_code_path
  output_path = var.lambda_source_code_zip_file
}

resource "aws_lambda_function" "lambda_function" {
  filename      = data.archive_file.lambda_source_code.output_path
  function_name = var.lambda_function_name
  role          = aws_iam_role.lambda_execution_role.arn

  layers           = var.lambda_function_layer_arns
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout_seconds
  handler          = var.lambda_function_handler
  source_code_hash = data.archive_file.lambda_source_code.output_base64sha256
  environment {
    variables = {
      for key, data in data.aws_ssm_parameter.ssm_parameter_env_variables : key => data.value
    }
  }
  depends_on = [aws_iam_role.lambda_execution_role]
}
