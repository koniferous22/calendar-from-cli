import { z } from 'zod'

export const adminApiUrl = z.string().url().parse(process.env.CALENDAR_FROM_CLI_ADMIN_API)
export const nodeEnv = z.string().parse(process.env.NODE_ENV)
export const awsAccessKey = z.string().parse(process.env.AWS_ACCESS_KEY_ID)
export const awsSecretAccessKey = z.string().parse(process.env.AWS_SECRET_ACCESS_KEY)
