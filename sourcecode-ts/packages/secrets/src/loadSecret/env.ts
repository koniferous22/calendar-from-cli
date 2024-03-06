import { z } from 'zod'

export const loadEnvVariableSecret = (envVariable: string) => z.string().parse(process.env[envVariable])
