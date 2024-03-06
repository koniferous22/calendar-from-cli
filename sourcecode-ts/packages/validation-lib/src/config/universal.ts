import { z } from 'zod'
import { zDescriptionFormat } from '../primitives/descriptionFormat.js'
import { zWebAppSettings } from '../primitives/webAppSettings.js'

const zUniversalConfigInputValidation = z.object({
  api: z.object({
    calendarList: z.object({
      lowerLimit: z.number(),
      maxYearsAhead: z.number().positive(),
    }),
    calendarItemSchedule: z.object({
      maxDurationMinutes: z.number().positive(),
      schedulingGracePeriodMillis: z.number().positive(),
    }),
  }),
  objectCountLimits: z.object({
    processTemplate: z.object({
      maxProcessItemAttachments: z.number().positive(),
    }),
    recurringEvent: z.object({
      maxRecurringEvents: z.number().positive(),
    }),
  }),
  objectFieldLimits: z.object({
    recurringEvent: z.object({
      periodLimits: z.object({
        maxDaily: z.number().positive(),
        maxWeekly: z.number().positive(),
        maxMonthly: z.number().positive(),
        maxYearly: z.number().positive(),
      }),
    }),
    processTemplate: z.object({
      offsetGapLimits: z.object({
        maxHourGap: z.number().positive(),
        maxDayGap: z.number().positive(),
        maxWeekGap: z.number().positive(),
        maxMonthGap: z.number().positive(),
        maxYearGap: z.number().positive(),
      }),
    }),
  }),
  // NOTE - string limits should be configured with respect to database settings
  stringLimits: z.object({
    event: z.object({
      maxTitleLength: z.number().positive(),
      maxDescriptionLength: z.number().positive(),
    }),
    eventTemplate: z.object({
      maxEventTemplateAliasLength: z.number().positive(),
    }),
    eventTag: z.object({
      maxEventTagAliasLength: z.number().positive(),
    }),
    recurringEvent: z.object({
      maxTitleLength: z.number().positive(),
      maxDescriptionLength: z.number().positive(),
    }),
    process: z.object({
      maxTitleLength: z.number().positive(),
      maxDescriptionLength: z.number().positive(),
    }),
    processTemplate: z.object({
      maxProcessTemplateAliasLength: z.number().positive(),
    }),
    trustedViewer: z.object({
      maxTrustedViewerAliasLength: z.number().positive(),
    }),
  }),
  passwordConstraints: z.object({
    minPasswordChars: z.number().positive(),
    shouldContainUppercase: z.boolean(),
    shouldContainLowercase: z.boolean(),
    shouldContainDigits: z.boolean(),
    shouldContainSpecialChars: z.boolean(),
    specialChars: z.object({
      characters: z.string(),
      testingRegex: z.string(),
    }),
  }),
  eventSourceTypes: z.object({
    updatingFlags: z.object({
      shouldAllowChangingAppointmentEvents: z.boolean(),
      shouldAllowChangingIntegrationEvents: z.boolean(),
    }),
  }),
})

const zContentDefaults = z.object({
  fallbackPublicTitle: z.string(),
  fallbackPublicDescription: z.object({
    content: z.string(),
    format: zDescriptionFormat,
  }),
})

export const zUniversalConfig = z
  .object(
    {
      timezone: z.string(),
      inputValidation: zUniversalConfigInputValidation,
      dbContentDefaults: z.object({
        scheduleEvent: zContentDefaults,
        scheduleProcess: zContentDefaults,
        scheduleRecurringEvent: zContentDefaults,
      }),
      defaultWebAppSettings: zWebAppSettings,
    },
    {
      invalid_type_error: 'Error loading common public config',
    },
  )
  .superRefine((universalConfig, ctx) => {
    const checkContentDefaultWithStringLimits = (
      contentType: string,
      contentDefaults: z.infer<typeof zContentDefaults>,
      maxTitleLength: number,
      maxDescriptionLength: number,
    ) => {
      if (contentDefaults.fallbackPublicTitle.length > maxTitleLength) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: maxTitleLength,
          type: 'string',
          inclusive: true,
          message: `Default '${contentType}' title exceeds maximum configured length of ${maxTitleLength} chars`,
        })
      }
      if (contentDefaults.fallbackPublicDescription.content.length > maxDescriptionLength) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: maxDescriptionLength,
          type: 'string',
          inclusive: true,
          message: `Default '${contentType}' description exceeds maximum configured length of ${maxDescriptionLength} chars`,
        })
      }
    }
    const eventStringLimits = universalConfig.inputValidation.stringLimits.event
    const recurringEventStringLimits = universalConfig.inputValidation.stringLimits.recurringEvent
    const processStringLimits = universalConfig.inputValidation.stringLimits.process
    checkContentDefaultWithStringLimits(
      'event',
      universalConfig.dbContentDefaults.scheduleEvent,
      eventStringLimits.maxTitleLength,
      eventStringLimits.maxDescriptionLength,
    )
    checkContentDefaultWithStringLimits(
      'recurringEvent',
      universalConfig.dbContentDefaults.scheduleRecurringEvent,
      recurringEventStringLimits.maxTitleLength,
      recurringEventStringLimits.maxDescriptionLength,
    )
    checkContentDefaultWithStringLimits(
      'process',
      universalConfig.dbContentDefaults.scheduleProcess,
      processStringLimits.maxTitleLength,
      processStringLimits.maxDescriptionLength,
    )
  })

export type UniversalConfig = z.infer<typeof zUniversalConfig>
