import { addHours, addMinutes } from 'date-fns'
import {
  addDSTAdjustedUTCDays,
  addDSTAdjustedUTCMonths,
  addDSTAdjustedUTCWeeks,
  addDSTAdjustedUTCYears,
  calculateDSTAdjustedHourMinuteOffsetForTimezone,
} from '../date/dst.js'
import {
  getUTCBeginningOfCurrentMonth,
  getUTCBeginningOfCurrentWeek,
  getUTCBeginningOfCurrentYear,
} from '../date/utc.js'

export const resolveEventImmediatellyAfter = (
  predecessorEndsAt: Date,
  _: string,
  gapHours: number,
  gapMinutes: number,
) => addMinutes(addHours(predecessorEndsAt, gapHours), gapMinutes)

export const resolveEventNearestTimeOfDay = (
  predecessorEndsAt: Date,
  timezone: string,
  hour: number,
  minute: number,
  gapDays: number,
) => {
  let daysToAdd = gapDays
  const { event: baselineEvent } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    predecessorEndsAt,
    hour,
    minute,
    timezone,
  )
  if (baselineEvent < predecessorEndsAt) {
    daysToAdd += 1
  }
  return addDSTAdjustedUTCDays(baselineEvent, daysToAdd, timezone)
}

export const resolveEventNearestDayOfWeek = (
  predecessorEndsAt: Date,
  timezone: string,
  dayOfWeek: number,
  hour: number,
  minute: number,
  gapWeeks: number,
) => {
  let weeksToAdd = gapWeeks
  const baselineWeek = getUTCBeginningOfCurrentWeek(predecessorEndsAt)
  const baselineDayOfWeek = addDSTAdjustedUTCDays(baselineWeek, dayOfWeek, timezone)
  const { event: baselineEvent } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    baselineDayOfWeek,
    hour,
    minute,
    timezone,
  )
  if (baselineEvent < predecessorEndsAt) {
    weeksToAdd += 1
  }
  return addDSTAdjustedUTCWeeks(baselineEvent, weeksToAdd, timezone)
}

export const resolveEventNearestDayOfWeekInMonth = (
  predecessorEndsAt: Date,
  timezone: string,
  weekOfMonth: number,
  dayOfWeek: number,
  hour: number,
  minute: number,
  gapMonths: number,
) => {
  let monthsToAdd = gapMonths
  const resolvedBeginningOfCurrentMonth = getUTCBeginningOfCurrentMonth(predecessorEndsAt)
  const resolvedWeekOfCurrentMonth = getUTCBeginningOfCurrentWeek(
    addDSTAdjustedUTCWeeks(resolvedBeginningOfCurrentMonth, weekOfMonth - 1, timezone),
  )
  const resolvedDayOfWeekInCurrentMonth = addDSTAdjustedUTCDays(resolvedWeekOfCurrentMonth, dayOfWeek, timezone)
  const { event: eventInCurrentMonth } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    resolvedDayOfWeekInCurrentMonth,
    hour,
    minute,
    timezone,
  )
  if (eventInCurrentMonth < predecessorEndsAt) {
    monthsToAdd += 1
  }
  const baselineMonth = addDSTAdjustedUTCMonths(resolvedBeginningOfCurrentMonth, monthsToAdd, timezone)
  const baselineWeekOfMonth = getUTCBeginningOfCurrentWeek(
    addDSTAdjustedUTCWeeks(baselineMonth, weekOfMonth - 1, timezone),
  )
  const baselineDayOfWeek = addDSTAdjustedUTCDays(baselineWeekOfMonth, dayOfWeek, timezone)
  return calculateDSTAdjustedHourMinuteOffsetForTimezone(baselineDayOfWeek, hour, minute, timezone).event
}

export const resolveEventNearestDayOfMonth = (
  predecessorEndsAt: Date,
  timezone: string,
  dayOfMonth: number,
  hour: number,
  minute: number,
  gapMonths: number,
) => {
  let monthsToAdd = gapMonths
  const resolvedBeginningOfCurrentMonth = getUTCBeginningOfCurrentMonth(predecessorEndsAt)
  const resolvedDayOfCurrentMonth = addDSTAdjustedUTCDays(resolvedBeginningOfCurrentMonth, dayOfMonth - 1, timezone)
  const { event: eventInCurrentMonth } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    resolvedDayOfCurrentMonth,
    hour,
    minute,
    timezone,
  )
  if (eventInCurrentMonth < predecessorEndsAt) {
    monthsToAdd += 1
  }
  const baselineMonth = addDSTAdjustedUTCMonths(resolvedBeginningOfCurrentMonth, monthsToAdd, timezone)
  const baselineDayOfMonth = addDSTAdjustedUTCDays(baselineMonth, dayOfMonth - 1, timezone)
  return calculateDSTAdjustedHourMinuteOffsetForTimezone(baselineDayOfMonth, hour, minute, timezone).event
}

export const resolveEventNearestDayOfWeekOfMonthInYear = (
  predecessorEndsAt: Date,
  timezone: string,
  month: number,
  weekOfMonth: number,
  dayOfWeek: number,
  hour: number,
  minute: number,
  gapYears: number,
) => {
  let yearsToAdd = gapYears
  const resolvedBeginningOfCurrentYear = getUTCBeginningOfCurrentYear(predecessorEndsAt)
  const resolvedMonthInCurrentYear = addDSTAdjustedUTCMonths(resolvedBeginningOfCurrentYear, month, timezone)
  const resolvedWeekOfMonthInCurrentYear = getUTCBeginningOfCurrentWeek(
    addDSTAdjustedUTCWeeks(resolvedMonthInCurrentYear, weekOfMonth - 1, timezone),
  )
  const resolvedDayOfWeekInCurrentYear = addDSTAdjustedUTCDays(resolvedWeekOfMonthInCurrentYear, dayOfWeek, timezone)
  const { event: eventInCurrentMonth } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    resolvedDayOfWeekInCurrentYear,
    hour,
    minute,
    timezone,
  )
  if (eventInCurrentMonth < predecessorEndsAt) {
    yearsToAdd += 1
  }
  const baselineYear = addDSTAdjustedUTCYears(resolvedBeginningOfCurrentYear, yearsToAdd, timezone)
  const baselineMonth = addDSTAdjustedUTCMonths(baselineYear, yearsToAdd, timezone)
  const baselineWeekOfMonth = getUTCBeginningOfCurrentWeek(
    addDSTAdjustedUTCWeeks(baselineMonth, weekOfMonth - 1, timezone),
  )
  const baselineDayOfWeek = addDSTAdjustedUTCDays(baselineWeekOfMonth, dayOfWeek, timezone)
  return calculateDSTAdjustedHourMinuteOffsetForTimezone(baselineDayOfWeek, hour, minute, timezone).event
}

export const resolveEventNearestDayOfWeekInYear = (
  predecessorEndsAt: Date,
  timezone: string,
  weekOfYear: number,
  dayOfWeek: number,
  hour: number,
  minute: number,
  gapYears: number,
) => {
  let yearsToAdd = gapYears
  const resolvedBeginningOfCurrentYear = getUTCBeginningOfCurrentYear(predecessorEndsAt)
  const resolvedWeekOfCurrentYear = getUTCBeginningOfCurrentWeek(
    addDSTAdjustedUTCWeeks(resolvedBeginningOfCurrentYear, weekOfYear - 1, timezone),
  )
  const resolvedDayOfWeekInCurrentYear = addDSTAdjustedUTCDays(resolvedWeekOfCurrentYear, dayOfWeek, timezone)
  const { event: eventInCurrentMonth } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    resolvedDayOfWeekInCurrentYear,
    hour,
    minute,
    timezone,
  )
  if (eventInCurrentMonth < predecessorEndsAt) {
    yearsToAdd += 1
  }
  const baselineYear = addDSTAdjustedUTCYears(resolvedBeginningOfCurrentYear, yearsToAdd, timezone)
  const baselineWeekOfMonth = getUTCBeginningOfCurrentWeek(
    addDSTAdjustedUTCWeeks(baselineYear, weekOfYear - 1, timezone),
  )
  const baselineDayOfWeek = addDSTAdjustedUTCDays(baselineWeekOfMonth, dayOfWeek, timezone)
  return calculateDSTAdjustedHourMinuteOffsetForTimezone(baselineDayOfWeek, hour, minute, timezone).event
}

export const resolveEventNearestDateInYear = (
  predecessorEndsAt: Date,
  timezone: string,
  month: number,
  dayOfMonth: number,
  hour: number,
  minute: number,
  gapYears: number,
) => {
  let yearsToAdd = gapYears
  const resolvedBeginningOfCurrentYear = getUTCBeginningOfCurrentYear(predecessorEndsAt)
  const resolvedMonthOfCurrentYear = addDSTAdjustedUTCMonths(resolvedBeginningOfCurrentYear, month, timezone)
  const resolvedDayOfMonthInCurrentYear = addDSTAdjustedUTCDays(resolvedMonthOfCurrentYear, dayOfMonth - 1, timezone)
  const { event: eventInCurrentMonth } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    resolvedDayOfMonthInCurrentYear,
    hour,
    minute,
    timezone,
  )
  if (eventInCurrentMonth < predecessorEndsAt) {
    yearsToAdd += 1
  }
  const baselineYear = addDSTAdjustedUTCYears(resolvedBeginningOfCurrentYear, yearsToAdd, timezone)
  const baselineMonth = addDSTAdjustedUTCMonths(baselineYear, month, timezone)
  const baselineDayOfMonth = addDSTAdjustedUTCDays(baselineMonth, dayOfMonth - 1, timezone)
  return calculateDSTAdjustedHourMinuteOffsetForTimezone(baselineDayOfMonth, hour, minute, timezone).event
}
