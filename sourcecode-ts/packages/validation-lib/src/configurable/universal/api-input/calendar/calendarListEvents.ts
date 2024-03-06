import { z } from 'zod'
import { createZClientTimezone } from '../../../../primitives/configurable/clientTimezone.js'
import { zDayOfYear, zMonth } from '../../../../primitives/calendar.js'
import { createZCalendarYear } from '../../../../primitives/configurable/calendarYear.js'

export const createZCalendarListEventsInDayInput = (
  lowerYearLimit: number,
  maxFutureYearLimit: number,
  userTimezone: string,
) =>
  z.intersection(
    z.object({
      year: createZCalendarYear(lowerYearLimit, maxFutureYearLimit),
      clientTimezone: createZClientTimezone(userTimezone),
    }),
    zDayOfYear,
  )

export const createZCalendarListEventsInWeekInput = (
  lowerYearLimit: number,
  maxFutureYearLimit: number,
  userTimezone: string,
) =>
  z.intersection(
    z.object({
      year: createZCalendarYear(lowerYearLimit, maxFutureYearLimit),
      clientTimezone: createZClientTimezone(userTimezone),
    }),
    zDayOfYear,
  )

export const createZCalendarListEventsInMonthInput = (
  lowerYearLimit: number,
  maxFutureYearLimit: number,
  userTimezone: string,
) =>
  z.object({
    year: createZCalendarYear(lowerYearLimit, maxFutureYearLimit),
    month: zMonth,
    clientTimezone: createZClientTimezone(userTimezone),
  })

export const createZCalendarListEventsInYearInput = (
  lowerYearLimit: number,
  maxFutureYearLimit: number,
  userTimezone: string,
) =>
  z.object({
    year: createZCalendarYear(lowerYearLimit, maxFutureYearLimit),
    clientTimezone: createZClientTimezone(userTimezone),
  })
