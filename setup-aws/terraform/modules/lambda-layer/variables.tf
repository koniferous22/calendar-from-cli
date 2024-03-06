variable "lambda_layer_source_directory" {
  type        = string
  description = "Source directory containing Lambda Layer contents"
}

variable "lambda_layer_zip_file" {
  type        = string
  description = "FS path of zipped Lambda Layer"
}

variable "lambda_layer_name" {
  type        = string
  description = "Name of the AWS Lambda Layer"
}

variable "lambda_runtime" {
  type        = string
  description = "Lambda runtime ('nodejs20.x' for example)"
}
