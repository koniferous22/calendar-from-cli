import { DescriptionFormat } from '@prisma/client'

export type ScheduleProcessFallbackPublicValues = {
  fallbackPublicTitle: string
  fallbackPublicDescription: {
    content: string
    format: DescriptionFormat
  }
}
