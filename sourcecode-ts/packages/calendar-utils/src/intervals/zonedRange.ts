import { addDays, addMonths, addWeeks, addYears } from 'date-fns'
import { calculateDSTAdjustedHourMinuteOffsetForTimezone } from '../date/dst.js'
import { createUTCDate, getUTCBeginningOfCurrentWeek } from '../date/utc.js'

export const createZonedDayInterval = (year: number, month: number, dayOfMonth: number, tz: string) => {
  const utcBeginOfDay = createUTCDate(year, month, dayOfMonth, 0, 0)
  const zonedBeginOfDay = calculateDSTAdjustedHourMinuteOffsetForTimezone(utcBeginOfDay, 0, 0, tz).event
  const zonedEndOfDay = addDays(zonedBeginOfDay, 1)
  return [zonedBeginOfDay, zonedEndOfDay] as const
}

export const createZonedWeekInterval = (year: number, month: number, dayOfMonth: number, tz: string) => {
  const utcBeginOfDay = createUTCDate(year, month, dayOfMonth, 0, 0)
  const utcBeginOfWeek = getUTCBeginningOfCurrentWeek(utcBeginOfDay)
  const zonedBeginOfWeek = calculateDSTAdjustedHourMinuteOffsetForTimezone(utcBeginOfWeek, 0, 0, tz).event
  const zonedEndOfWeek = addWeeks(zonedBeginOfWeek, 1)
  return [zonedBeginOfWeek, zonedEndOfWeek] as const
}

export const createZonedMonthInterval = (year: number, month: number, tz: string) => {
  const utcBeginOfMonth = createUTCDate(year, month, 1, 0, 0)
  const zonedBeginOfMonth = calculateDSTAdjustedHourMinuteOffsetForTimezone(utcBeginOfMonth, 0, 0, tz).event
  const zonedEndOfMonth = addMonths(zonedBeginOfMonth, 1)
  return [zonedBeginOfMonth, zonedEndOfMonth] as const
}

export const createZonedYearInterval = (year: number, tz: string) => {
  const utcBeginOfYear = createUTCDate(year, 0, 1, 0, 0)
  const zonedBeginOfYear = calculateDSTAdjustedHourMinuteOffsetForTimezone(utcBeginOfYear, 0, 0, tz).event
  const zonedEndOfYear = addYears(zonedBeginOfYear, 1)
  return [zonedBeginOfYear, zonedEndOfYear] as const
}

const adjustFutureInterval = (interval: readonly [Date, Date]) => {
  const [originalFrom] = interval
  const now = new Date()
  const intervalBegin = now > originalFrom ? now : originalFrom
  return [intervalBegin, interval[1]] as const
}

export const createFutureZonedDayInterval = (year: number, month: number, dayOfMonth: number, tz: string) => {
  return adjustFutureInterval(createZonedDayInterval(year, month, dayOfMonth, tz))
}

export const createFutureZonedWeekInterval = (year: number, month: number, dayOfMonth: number, tz: string) => {
  return adjustFutureInterval(createZonedWeekInterval(year, month, dayOfMonth, tz))
}

export const createFutureZonedMonthInterval = (year: number, month: number, tz: string) => {
  return adjustFutureInterval(createZonedMonthInterval(year, month, tz))
}

export const createFutureZonedYearInterval = (year: number, tz: string) => {
  return adjustFutureInterval(createZonedYearInterval(year, tz))
}
