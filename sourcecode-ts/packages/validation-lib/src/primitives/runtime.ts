import { z } from 'zod'

export const zRuntime = z.union([z.literal('local'), z.literal('docker'), z.literal('serverless')])
