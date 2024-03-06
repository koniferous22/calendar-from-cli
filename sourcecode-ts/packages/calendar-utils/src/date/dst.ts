import { addDays, addMonths, addWeeks, addYears } from 'date-fns'
import { getTimezoneOffset, zonedTimeToUtc } from 'date-fns-tz'
import { getUTCBeginningOfCurrentDay } from './utc.js'

export const calculateDSTIntroducedOffset = (earlierEvent: Date, laterEvent: Date, localeTimezone: string) => {
  const timezoneOffsetEarlier = getTimezoneOffset(localeTimezone, earlierEvent)
  const timezoneOffsetLater = getTimezoneOffset(localeTimezone, laterEvent)
  return timezoneOffsetLater - timezoneOffsetEarlier
}

const wrapDSTadjust = (shift: (date: Date) => Date, base: Date, localeTimezone: string) => {
  const dateAfter = shift(base)
  const dstIntroducedOffset = calculateDSTIntroducedOffset(base, dateAfter, localeTimezone)
  return new Date(dateAfter.getTime() + dstIntroducedOffset)
}

// Note the purpose of these date addition functions is to always ensure that 24 hours are added
// 'addDays' from date-fns can add 23 hours and consider it 1 days, because of the daylight savings time
export const addDSTAdjustedUTCDays = (base: Date, daysToAdd: number, localeTimezone: string) =>
  wrapDSTadjust((d) => addDays(d, daysToAdd), base, localeTimezone)
export const addDSTAdjustedUTCWeeks = (base: Date, weeksToAdd: number, localeTimezone: string) =>
  wrapDSTadjust((d) => addWeeks(d, weeksToAdd), base, localeTimezone)
export const addDSTAdjustedUTCMonths = (base: Date, monthsToAdd: number, localeTimezone: string) =>
  wrapDSTadjust((d) => addMonths(d, monthsToAdd), base, localeTimezone)
export const addDSTAdjustedUTCYears = (base: Date, yearsToAdd: number, localeTimezone: string) =>
  wrapDSTadjust((d) => addYears(d, yearsToAdd), base, localeTimezone)

export const calculateDSTAdjustedTimeOffset = (earlierEvent: Date, laterEvent: Date, localeTimezone: string) => {
  const utcEarlierEvent = zonedTimeToUtc(earlierEvent, localeTimezone)
  const utcLaterEvent = zonedTimeToUtc(laterEvent, localeTimezone)
  const dstIntroducedOffset = calculateDSTIntroducedOffset(earlierEvent, laterEvent, localeTimezone)
  return utcLaterEvent.getTime() - utcEarlierEvent.getTime() - dstIntroducedOffset
}

const millisecondsInDay = 24 * 60 * 60 * 1000

export const calculateDSTAdjustedTimeOffsetInDays = (earlierEvent: Date, laterEvent: Date, localeTimezone: string) => {
  const offsetInMilliseconds = calculateDSTAdjustedTimeOffset(earlierEvent, laterEvent, localeTimezone)
  const days = Math.floor(offsetInMilliseconds / millisecondsInDay)
  const remainder = offsetInMilliseconds % millisecondsInDay
  return {
    days,
    remainder,
    isExact: remainder === 0,
  }
}

// 1. Calculate timezone offset at UTC beginning of day
// 2. result = timezoneOffset + hours + minutes
// 3. If timezone offset of resulting event is different from timezone offset at the beginning of the date, add difference between the two to the result
export const calculateDSTAdjustedHourMinuteOffsetForTimezone = (
  event: Date,
  hour: number,
  minute: number,
  localeTimezone: string,
) => {
  const utcBeginningOfDay = getUTCBeginningOfCurrentDay(event)
  const timezoneOffsetAtBeginningOfUtcDay = getTimezoneOffset(localeTimezone, utcBeginningOfDay)
  const minutes = 60 * hour + minute
  const eventOffset = minutes * 60 * 1000 - timezoneOffsetAtBeginningOfUtcDay
  const resultEventWithoutDSTAdjustment = new Date(utcBeginningOfDay.getTime() + eventOffset)
  const dstIntroducedOffset = calculateDSTIntroducedOffset(
    utcBeginningOfDay,
    resultEventWithoutDSTAdjustment,
    localeTimezone,
  )
  const dstAdjustedEventOffset = eventOffset - dstIntroducedOffset
  return {
    eventOffset: dstAdjustedEventOffset,
    event: new Date(utcBeginningOfDay.getTime() + dstAdjustedEventOffset),
  }
}
