import { z } from 'zod'

export const zGenericSecretReaderOptions = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('env'),
    envVariable: z.string(),
  }),
])

export const zAwsAccessKeysSecretReaderOptions = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('env'),
  }),
])
