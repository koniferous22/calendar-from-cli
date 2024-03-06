resource "aws_apigatewayv2_api" "api" {
  name          = var.apigateway_api_name
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "api_stage" {
  api_id = aws_apigatewayv2_api.api.id

  name        = var.apigateway_stage_name
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway_log_group.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
  default_route_settings {
    throttling_burst_limit = 50
    throttling_rate_limit  = 100
  }
}

resource "aws_apigatewayv2_integration" "api_integration" {
  api_id = aws_apigatewayv2_api.api.id

  integration_uri    = var.lambda_invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "api_route_any" {
  api_id = aws_apigatewayv2_api.api.id

  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.api_integration.id}"

  authorization_type = var.apigateway_api_route_authorization_type
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = var.apigateway_permission_statement_id
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_domain_name" "api_domain_name" {
  domain_name = local.api_full_domain

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.api_cert.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "api_domain_name_mapping" {
  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.api_domain_name.id
  stage       = aws_apigatewayv2_stage.api_stage.id
}
