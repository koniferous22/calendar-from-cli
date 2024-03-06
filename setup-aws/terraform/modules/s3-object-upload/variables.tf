variable "s3_bucket" {
  type        = string
  description = "S3 Bucket for objects upload"
}

variable "mime_content_type" {
  type        = string
  description = "Mime content type for uploaded files"
}

variable "objects_dist_root" {
  type        = string
  description = "Filepath to local dist of website"
}

variable "objects_search_pattern" {
  type        = string
  description = "Glob pattern for matching entries in the filesystem"
}
