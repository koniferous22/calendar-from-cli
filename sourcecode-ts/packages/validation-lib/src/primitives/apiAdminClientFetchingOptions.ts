import { z } from 'zod'
import { zAwsAccessKeysSecretReaderOptions } from './secretReaderOptions.js'

export const zApiAdminClientFetchingOptions = z.discriminatedUnion('apiAdminRuntime', [
  z.object({
    apiAdminRuntime: z.literal('local'),
  }),
  z.object({
    apiAdminRuntime: z.literal('docker'),
  }),
  z.object({
    apiAdminRuntime: z.literal('serverless'),
    shouldUseSignaturev4: z.boolean(),
    deployedApiAwsRegion: z.string(),
    awsAccessKeySecretConfig: zAwsAccessKeysSecretReaderOptions,
  }),
])
