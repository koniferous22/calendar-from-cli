import { addWeeks, getWeeksInMonth } from 'date-fns'
import { createUTCDate, getUTCBeginningOfCurrentWeek } from '../date/utc.js'
import { calculateDSTAdjustedHourMinuteOffsetForTimezone } from '../date/dst.js'

export const createMonthCalendarRangeInterval = (year: number, month: number, tz: string) => {
  const utcBeginOfMonth = createUTCDate(year, month, 1, 0, 0)
  const weeksInMonth = getWeeksInMonth(utcBeginOfMonth)
  // Note - UTC beginning of week used instead of zoned, because of different week formats (starting of Sunday, vs. Monday)
  const calendarViewUtcBeginOfMonth = getUTCBeginningOfCurrentWeek(utcBeginOfMonth)
  const calendarViewZonedBeginOfMonth = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    calendarViewUtcBeginOfMonth,
    0,
    0,
    tz,
  ).event
  // Note - adding zoned weeks because of DST issues
  const calendarViewZonedEndOfMonth = addWeeks(calendarViewZonedBeginOfMonth, weeksInMonth)
  return [calendarViewZonedBeginOfMonth, calendarViewZonedEndOfMonth] as const
}
