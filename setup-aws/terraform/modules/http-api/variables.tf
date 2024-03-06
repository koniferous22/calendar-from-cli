variable "route53_parent_domain_name" {
  type        = string
  description = "Route 53 Parent Domain used for the project"
}

variable "route53_api_subdomain_prefix" {
  type        = string
  description = "Hostname subdomain prefix (prepended to parent domain name)"
}

variable "apigateway_api_name" {
  type        = string
  description = "Name of AWS API gateway"
}

variable "apigateway_stage_name" {
  type        = string
  description = "Name of AWS API gateway stage"
}

variable "apigateway_api_route_authorization_type" {
  type        = string
  description = "'authorization_type' for AWS API Gateway route used for HTTP server"
}

variable "apigateway_permission_statement_id" {
  type        = string
  description = "IAM sid for AWS API Gateway permission to invoke Lambda HTTP API"
}

variable "lambda_function_name" {
  type        = string
  description = "Name of AWS Lambda function, used as HTTP server"
}

variable "lambda_invoke_arn" {
  type        = string
  description = "AWS Lambda invoke ARN, used for AWS API Gateway integration"
}
