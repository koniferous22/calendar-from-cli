variable "api_gateway_api_id" {
  type        = string
  description = "Id from AWS API Gateway API"
}

variable "api_gateway_api_stage" {
  type        = string
  description = "Stage from AWS API Gateway API"
}

variable "iam_group_name" {
  type        = string
  description = "Name of the IAM group with calendar admin permission"
}

variable "iam_group_policy_name" {
  type        = string
  description = "Name of the execute-api policy attached to IAM Group"
}

variable "iam_user_name" {
  type        = string
  description = "Name of the group member IAM user"
}
