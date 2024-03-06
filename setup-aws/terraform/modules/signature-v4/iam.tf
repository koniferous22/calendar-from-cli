// This module takes takes care of creds required for signaturev4 request signing
// Use Case - IAM Authorization for Calendar Admin API gateway

resource "aws_iam_group" "calendar_administrators" {
  name = var.iam_group_name
}

resource "aws_iam_group_policy" "my_developer_policy" {
  name  = var.iam_group_policy_name
  group = aws_iam_group.calendar_administrators.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "execute-api:Invoke",
        ]
        Effect = "Allow"
        // Provides access to 'execute-api
        // * current aws region and account
        // * specified calendar api id
        // * specified calendar stage id
        // * all methods on all paths
        Resource = "arn:aws:execute-api:${data.aws_region.current_aws_region.name}:${data.aws_caller_identity.current_aws_account.account_id}:${var.api_gateway_api_id}/${var.api_gateway_api_stage}/*"
      },
    ]
  })
}

resource "aws_iam_user" "calendar_administrator" {
  name = var.iam_user_name
}

resource "aws_iam_user_group_membership" "calendar_administrator_groups" {
  user = aws_iam_user.calendar_administrator.name

  groups = [
    aws_iam_group.calendar_administrators.name
  ]
}
