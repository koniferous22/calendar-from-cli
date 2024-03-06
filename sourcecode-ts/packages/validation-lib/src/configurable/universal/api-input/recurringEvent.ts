import { z } from 'zod'
import { createZRecurringEventSchedule } from '../../../primitives/configurable/recurringEventSchedule.js'
import { UniversalConfig } from '../../../config/universal.js'
import { createZEventDuration } from '../../../primitives/configurable/eventDuration.js'
import { createZFutureISODatetime } from '../../../primitives/configurable/futureIsoDatetime.js'

const recurringEventId = z.number()
const recurringEventInstanceId = z.number()
const shouldCancelConvertedEvents = z.boolean()

export const zCancelRecurringEventInput = z.object({
  id: recurringEventId,
  shouldCancelConvertedEvents,
})

export const zCancelRecurringEventInstanceInput = z.object({
  instanceId: recurringEventInstanceId,
})

export const createZUpdateRecurringEventScheduleInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    id: recurringEventId,
    recurringEventSchedule: createZRecurringEventSchedule(
      inputValidation.objectFieldLimits.recurringEvent.periodLimits,
    ),
    durationOverride: z.optional(createZEventDuration(inputValidation.api.calendarItemSchedule.maxDurationMinutes)),
    startSinceOverride: z.optional(
      createZFutureISODatetime(inputValidation.api.calendarItemSchedule.schedulingGracePeriodMillis),
    ),
    shouldCancelConvertedEvents,
  })

export const createZRescheduleRecurringEventInstanceInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    instanceId: recurringEventInstanceId,
    durationOverride: z.optional(createZEventDuration(inputValidation.api.calendarItemSchedule.maxDurationMinutes)),
    scheduledAtUTCOverride: z.optional(
      createZFutureISODatetime(inputValidation.api.calendarItemSchedule.schedulingGracePeriodMillis),
    ),
  })
