import { z } from 'zod'

export const nodeEnv = z.string().parse(process.env.NODE_ENV)
// Note - not used by the application, just should be preloaded as it is required for some inquirer CLI features
z.string().parse(process.env.EDITOR)
