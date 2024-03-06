import { z } from 'zod'

export const createZCalendarYear = (lowerYearLimit: number, maxFutureYearLimit: number) =>
  z
    .number()
    .min(lowerYearLimit, `Lowest possible year limit allowed for listing is ${lowerYearLimit}`)
    .refine(
      // NOTE - new date instance should be required on each validation, to prevent incorrect resolution
      (year) => year <= new Date().getFullYear() + maxFutureYearLimit,
      `Cannot list further than ${maxFutureYearLimit} ahead`,
    )
