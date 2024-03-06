import { z } from 'zod'
import { createZCalendarYear } from '../../../primitives/configurable/calendarYear.js'
import { zUrlDayOfYear, zUrlMonth, zUrlNumber } from '../../../primitives/url.js'

export const createZUrlCalendarRangeIdentifier = (lowerYearLimit: number, maxFutureYearLimit: number) =>
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal('dayLaneView'),
      identifier: z.intersection(
        z.object({
          year: zUrlNumber.pipe(createZCalendarYear(lowerYearLimit, maxFutureYearLimit)),
        }),
        zUrlDayOfYear,
      ),
    }),
    z.object({
      type: z.literal('weekLaneView'),
      identifier: z.intersection(
        z.object({
          year: zUrlNumber.pipe(createZCalendarYear(lowerYearLimit, maxFutureYearLimit)),
        }),
        zUrlDayOfYear,
      ),
    }),
    z.object({
      type: z.literal('monthCellView'),
      identifier: z.object({
        year: zUrlNumber.pipe(createZCalendarYear(lowerYearLimit, maxFutureYearLimit)),
        month: zUrlMonth,
      }),
    }),
  ])
