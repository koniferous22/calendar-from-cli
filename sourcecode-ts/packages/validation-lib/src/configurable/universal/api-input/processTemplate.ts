import { z } from 'zod'
import { UniversalConfig } from '../../../config/universal.js'
import { createZLimitedString } from '../../../primitives/configurable/string.js'
import { zEncodedHexColor } from '../../../utils/hexColor.js'
import { createZEventTemplateAlias } from './eventTemplate.js'
import { createZProcessItemOffset } from '../../../primitives/configurable/processItemOffset.js'
import { zTransparencyScopeSchema } from '../../../primitives/transparencyScope.js'
import { createZFutureISODatetime } from '../../../primitives/configurable/futureIsoDatetime.js'
import { zDescriptionFormat } from '../../../primitives/descriptionFormat.js'

const createZProcessTemplateAlias = (maxProcessTemplateAliasLength: number) =>
  createZLimitedString(maxProcessTemplateAliasLength)

export const createZUpsertProcessTemplateInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    fields: z.object({
      alias: createZProcessTemplateAlias(inputValidation.stringLimits.processTemplate.maxProcessTemplateAliasLength),
      transparencyScope: zTransparencyScopeSchema,
      title: createZLimitedString(inputValidation.stringLimits.process.maxTitleLength),
      description: createZLimitedString(inputValidation.stringLimits.process.maxDescriptionLength),
      descriptionFormat: zDescriptionFormat,
      protectedTitle: z.optional(createZLimitedString(inputValidation.stringLimits.process.maxTitleLength)),
      protectedDescription: z.optional(createZLimitedString(inputValidation.stringLimits.process.maxDescriptionLength)),
      protectedDescriptionFormat: z.optional(zDescriptionFormat),
      publicTitle: z.optional(createZLimitedString(inputValidation.stringLimits.process.maxTitleLength)),
      publicDescription: z.optional(createZLimitedString(inputValidation.stringLimits.process.maxDescriptionLength)),
      publicDescriptionFormat: z.optional(zDescriptionFormat),
      tagAlias: z.optional(createZLimitedString(inputValidation.stringLimits.eventTag.maxEventTagAliasLength)),
      processColor: z.optional(zEncodedHexColor),
    }),
    attachments: z
      .array(
        z.object({
          eventTemplateAlias: createZEventTemplateAlias(
            inputValidation.stringLimits.eventTemplate.maxEventTemplateAliasLength,
          ),
          processItemOffset: createZProcessItemOffset(
            inputValidation.objectFieldLimits.processTemplate.offsetGapLimits,
          ),
        }),
      )
      .nonempty()
      .max(inputValidation.objectCountLimits.processTemplate.maxProcessItemAttachments),
  })

export const createZRemoveProcessTemplateInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    alias: createZProcessTemplateAlias(inputValidation.stringLimits.processTemplate.maxProcessTemplateAliasLength),
  })

export const createZScheduleProcessFromProcessTemplateInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    alias: createZEventTemplateAlias(inputValidation.stringLimits.processTemplate.maxProcessTemplateAliasLength),
    scheduleBaselineUTC: createZFutureISODatetime(inputValidation.api.calendarItemSchedule.schedulingGracePeriodMillis),
  })
