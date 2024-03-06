resource "aws_s3_object" "bulk_object_upload" {
  for_each     = fileset(var.objects_dist_root, var.objects_search_pattern)
  bucket       = var.s3_bucket
  key          = each.value
  source       = "${var.objects_dist_root}/${each.value}"
  content_type = var.mime_content_type
  etag         = filemd5("${var.objects_dist_root}/${each.value}")
}
