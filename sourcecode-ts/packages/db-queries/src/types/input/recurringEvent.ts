import { DescriptionFormat } from '@prisma/client'

export type ScheduleRecurringEventFallbackPublicValues = {
  fallbackPublicTitle: string
  fallbackPublicDescription: {
    content: string
    format: DescriptionFormat
  }
}
