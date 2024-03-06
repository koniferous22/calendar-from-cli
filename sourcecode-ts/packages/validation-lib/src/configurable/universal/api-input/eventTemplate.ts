import { z } from 'zod'
import { zTransparencyScopeSchema } from '../../../primitives/transparencyScope.js'
import { UniversalConfig } from '../../../config/universal.js'
import { createZLimitedString } from '../../../primitives/configurable/string.js'
import { createZEventDuration } from '../../../primitives/configurable/eventDuration.js'
import { zJson } from '../../../utils/json.js'
import { createZFutureISODatetime } from '../../../primitives/configurable/futureIsoDatetime.js'
import { createZRecurringEventSchedule } from '../../../primitives/configurable/recurringEventSchedule.js'
import { zDescriptionFormat } from '../../../primitives/descriptionFormat.js'

export const createZEventTemplateAlias = (maxEventTemplateAliasLength: number) =>
  createZLimitedString(maxEventTemplateAliasLength)

export const createZUpsertEventTemplateInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    alias: createZEventTemplateAlias(inputValidation.stringLimits.eventTemplate.maxEventTemplateAliasLength),
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
    metadata: z.optional(zJson),
  })

export const createZRemoveEventTemplateInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    alias: createZEventTemplateAlias(inputValidation.stringLimits.eventTemplate.maxEventTemplateAliasLength),
  })

export const createZScheduleEventFromEventTemplateInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    alias: createZEventTemplateAlias(inputValidation.stringLimits.eventTemplate.maxEventTemplateAliasLength),
    scheduledAtUTC: createZFutureISODatetime(inputValidation.api.calendarItemSchedule.schedulingGracePeriodMillis),
  })

export const createZScheduleRecurringEventFromEventTemplateInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    alias: createZEventTemplateAlias(inputValidation.stringLimits.eventTemplate.maxEventTemplateAliasLength),
    recurringEventSchedule: createZRecurringEventSchedule(
      inputValidation.objectFieldLimits.recurringEvent.periodLimits,
    ),
    startInstancesSince: createZFutureISODatetime(inputValidation.api.calendarItemSchedule.schedulingGracePeriodMillis),
  })
