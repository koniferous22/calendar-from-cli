output "api_gateway_api_id" {
  value = aws_apigatewayv2_api.api.id
}

output "api_gateway_api_stage" {
  value = aws_apigatewayv2_stage.api_stage.name
}

output "api_domain_name" {
  value = aws_apigatewayv2_domain_name.api_domain_name.domain_name
}