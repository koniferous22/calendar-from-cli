import { z } from 'zod'

export const zCalendarPageError = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('invalidRangeIdentifier'),
  }),
  z.object({
    type: z.literal('unauthorizedPastAccess'),
    pathIdentifier: z.string(),
  }),
])
