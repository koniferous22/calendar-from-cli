import { z } from 'zod'
import { zDayOfYear, zMonth } from './calendar.js'

export const zUrlNumber = z.union([z.number(), z.string()]).pipe(z.coerce.number())

// Note - month in url is human-readable, i.e. 1-12, as opposed to 0-11
export const zUrlMonth = zUrlNumber.transform((monthIndex) => monthIndex - 1).pipe(zMonth)

export const zUrlDayOfYear = z
  .object({
    month: zUrlNumber.transform((monthIndex) => monthIndex - 1),
    dayOfMonth: zUrlNumber,
  })
  .pipe(zDayOfYear)
