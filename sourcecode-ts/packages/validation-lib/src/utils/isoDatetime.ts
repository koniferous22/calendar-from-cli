import { z } from 'zod'

export const zISODatetime = z.string().datetime().pipe(z.coerce.date())

export const zFutureISODatetime = zISODatetime.refine(
  (date) => date.getTime() >= new Date().getTime(),
  (date) => ({ message: `${date.toISOString()} occurs in past (expected future)` }),
)
