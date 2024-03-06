import { z } from 'zod'
import { config } from '@calendar-from-cli/validation-lib'

const zBcryptjsConfig = z.object({
  saltRounds: z.number(),
})

const zJobsConfig = z.object({
  migratePast: z.object({
    jobSettings: z.object({
      shouldCheckForCorruptDbState: z.boolean(),
    }),
    enabledMiddlewareTriggers: z.object({
      calendarRouter: z.object({
        calendarListProcedure: z.boolean(),
      }),
    }),
  }),
  calendarCleanup: z.object({
    enabledMiddlewareTriggers: z.object({
      eventRouter: z.object({
        eventUpdateProcedure: z.boolean(),
      }),
      eventTagRouter: z.object({
        eventTagUpdateProcedure: z.boolean(),
      }),
      eventTemplateRouter: z.object({
        eventTemplateUpdateProcedure: z.boolean(),
        eventTemplateScheduleProcedure: z.boolean(),
      }),
      processRouter: z.object({
        processUpdateProcedure: z.boolean(),
      }),
      processTemplateRouter: z.object({
        processTemplateUpdateProcedure: z.boolean(),
        processTemplateScheduleProcedure: z.boolean(),
      }),
      recurringEventRouter: z.object({
        recurringEventUpdateProcedure: z.boolean(),
      }),
      trustedViewerRouter: z.object({
        trustedViewerUpdateProcedure: z.boolean(),
      }),
    }),
    enabledEndpointTrigger: z.boolean(),
  }),
})

const zServer = z.object({
  port: z.number(),
  stderrLogging: z.boolean(),
  bodyParserMiddleware: z.boolean(),
})

export const zApiAdminConfig = z.intersection(
  config.zBackendConfig,
  z.object({
    server: zServer,
    bcryptjs: zBcryptjsConfig,
    jobs: zJobsConfig,
  }),
)
