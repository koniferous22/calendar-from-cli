import { z } from 'zod'
import { zUniversalConfig } from './universal.js'

const zRecurringEventsSync = z.object({
  automaticUpdateForUnaffected: z.object({
    recurringEvents: z.boolean(),
    recurringEventInstances: z.boolean(),
  }),
})

export const zBackendConfig = z.intersection(
  zUniversalConfig,
  z.object({
    recurringEventsSync: zRecurringEventsSync,
  }),
)

export type BackendConfig = z.infer<typeof zBackendConfig>
