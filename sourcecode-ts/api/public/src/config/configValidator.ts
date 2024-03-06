import { z } from 'zod'
import { config as configValidators, primitives } from '@calendar-from-cli/validation-lib'

const zAuthConfig = z.object({
  refreshToken: z.object({
    implementation: z.discriminatedUnion('type', [
      z.object({
        type: z.literal('authorizationHeader'),
      }),
      z.object({
        type: z.literal('cookieHeader'),
        cookieKey: z.string(),
        cookieAttributes: z.object({
          httpOnly: z.boolean(),
          secure: z.boolean(),
          path: z.string().optional(),
        }),
      }),
    ]),
    expirationPeriodSeconds: z.number(),
    opts: z.object({
      randomBytesLength: z.number(),
      bcryptSaltRounds: z.number(),
    }),
  }),
  accessToken: z.object({
    expirationPeriodSeconds: z.number(),
  }),
})

const zCorsConfig = z.discriminatedUnion('enabled', [
  z.object({
    enabled: z.literal(false),
  }),
  z.object({
    enabled: z.literal(true),
    whitelist: z.array(z.string()).nonempty(),
  }),
])

const zJobsConfig = z.object({
  migratePast: z.object({
    jobSettings: z.object({
      shouldCheckForCorruptDbState: z.boolean(),
    }),
    enabledMiddlewareTriggers: z.object({
      calendarRouter: z.object({
        publicCalendarListProcedure: z.boolean(),
        calendarListProcedure: z.boolean(),
      }),
    }),
  }),
})

const zSecrets = z.object({
  jwtSecret: primitives.zGenericSecretReaderOptions,
})

const zServer = z.object({
  port: z.number(),
  stderrLogging: z.boolean(),
  bodyParserMiddleware: z.boolean(),
})

export const zApiPublicConfig = z.intersection(
  configValidators.zBackendConfig,
  z.object({
    auth: zAuthConfig,
    cors: zCorsConfig,
    jobs: zJobsConfig,
    secrets: zSecrets,
    server: zServer,
  }),
)
