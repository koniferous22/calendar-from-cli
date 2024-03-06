import { z } from 'zod'
import { UniversalConfig } from '../../../config/universal.js'
import { createZEventDuration } from '../../../primitives/configurable/eventDuration.js'
import { createZFutureISODatetime } from '../../../primitives/configurable/futureIsoDatetime.js'
import { zTransparencyScopeSchema } from '../../../primitives/transparencyScope.js'
import { createZLimitedString } from '../../../primitives/configurable/string.js'
import { zDescriptionFormat } from '../../../primitives/descriptionFormat.js'

const eventId = z.number()

export const createZRescheduleEventInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    id: eventId,
    duration: createZEventDuration(inputValidation.api.calendarItemSchedule.maxDurationMinutes),
    scheduledAtUTC: createZFutureISODatetime(inputValidation.api.calendarItemSchedule.schedulingGracePeriodMillis),
  })

export const createZCancelEventInput = (_: UniversalConfig) =>
  z.object({
    id: eventId,
  })

export const createZScheduleAdHocEventInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    transparencyScope: zTransparencyScopeSchema,
    title: createZLimitedString(inputValidation.stringLimits.event.maxTitleLength),
    description: createZLimitedString(inputValidation.stringLimits.event.maxDescriptionLength),
    descriptionFormat: zDescriptionFormat,
    protectedTitle: z.optional(createZLimitedString(inputValidation.stringLimits.event.maxTitleLength)),
    protectedDescription: z.optional(createZLimitedString(inputValidation.stringLimits.event.maxDescriptionLength)),
    protectedDescriptionFormat: z.optional(zDescriptionFormat),
    publicTitle: z.optional(createZLimitedString(inputValidation.stringLimits.event.maxTitleLength)),
    publicDescription: z.optional(createZLimitedString(inputValidation.stringLimits.event.maxDescriptionLength)),
    publicDescriptionFormat: z.optional(zDescriptionFormat),
    tagAlias: z.optional(createZLimitedString(inputValidation.stringLimits.eventTag.maxEventTagAliasLength)),
    duration: createZEventDuration(inputValidation.api.calendarItemSchedule.maxDurationMinutes),
    scheduledAtUTC: createZFutureISODatetime(inputValidation.api.calendarItemSchedule.schedulingGracePeriodMillis),
  })
