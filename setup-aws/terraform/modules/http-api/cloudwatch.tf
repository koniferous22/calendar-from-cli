resource "aws_cloudwatch_log_group" "api_gateway_log_group" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.api.name}"

  retention_in_days = 30
}
