import { z } from 'zod'
import { UniversalConfig } from '../../../config/universal.js'
import { createZFutureISODatetime } from '../../../primitives/configurable/futureIsoDatetime.js'
import { createZEventDuration } from '../../../primitives/configurable/eventDuration.js'

const processId = z.number()
const processItemAttachmentId = z.number()

export const zCancelProcessItemSubsequentProcessItemsBehaviour = z.union([
  z.literal('cancelRest'),
  z.literal('keepInPlace'),
  z.literal('preserveCalculatedOffsets'),
  z.literal('reevaluateRelations'),
])

export const zRescheduleProcessItemSubsequentProcessItemsBehaviour = z.union([
  z.literal('keepInPlace'),
  z.literal('preserveCalculatedOffsets'),
  z.literal('reevaluateRelations'),
])

export const zCancelProcessInput = z.object({
  id: processId,
})

export const createZRescheduleProcessInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    id: processId,
    scheduleBaselineUTC: createZFutureISODatetime(inputValidation.api.calendarItemSchedule.schedulingGracePeriodMillis),
  })

export const createZCancelProcessItemInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    itemAttachmentId: processItemAttachmentId,
    subsequentProcessItemsBehaviour: zCancelProcessItemSubsequentProcessItemsBehaviour,
  })

export const createZRescheduleProcessItemInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    itemAttachmentId: processItemAttachmentId,
    subsequentProcessItemsBehaviour: zRescheduleProcessItemSubsequentProcessItemsBehaviour,
    scheduledAtUTC: createZFutureISODatetime(inputValidation.api.calendarItemSchedule.schedulingGracePeriodMillis),
    duration: createZEventDuration(inputValidation.api.calendarItemSchedule.maxDurationMinutes),
  })
