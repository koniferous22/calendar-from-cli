import { z } from 'zod'

export const createZClientTimezone = (userTimezone: string) => z.string().default(userTimezone)
