import { Event as CalendarEvent, EventTemplate, DescriptionFormat } from '@prisma/client'

export type CommonEventFields = Omit<EventTemplate, 'Id' | 'CreatedAt' | 'Alias' | 'UpdatedAt' | 'Metadata'> &
  Pick<CalendarEvent, 'ScheduledAtUTC'>

export type ProcessEventRescheduleUpdate = Pick<CalendarEvent, 'Id' | 'Duration' | 'ScheduledAtUTC'>

export type ConvertRecurringEventInstanceOptions =
  | {
      type: 'reschedule'
      eventState: 'Active'
      duration: number
      scheduledAtUTC: Date
    }
  | {
      type: 'cancel'
      eventState: 'Cancelled'
    }

export type ScheduleEventFallbackPublicValues = {
  fallbackPublicTitle: string
  fallbackPublicDescription: {
    content: string
    format: DescriptionFormat
  }
}
