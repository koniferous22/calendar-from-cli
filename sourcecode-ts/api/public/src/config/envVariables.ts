import { primitives } from '@calendar-from-cli/validation-lib'
import { z } from 'zod'

const resolveEnvVariables = () => ({
  nodeEnv: z.union([z.literal('dev'), z.literal('prod')]).parse(process.env.NODE_ENV),
  runtime: primitives.zRuntime.parse(process.env.CALENDAR_API_PUBLIC_RUNTIME),
})

let envVariables = null as null | ReturnType<typeof resolveEnvVariables>

export const getEnvVariables = () => {
  if (envVariables === null) {
    envVariables = resolveEnvVariables()
  }
  return envVariables
}
