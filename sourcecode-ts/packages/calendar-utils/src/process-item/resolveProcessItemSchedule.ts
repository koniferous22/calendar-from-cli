import { types } from '@calendar-from-cli/validation-lib'
import {
  resolveEventImmediatellyAfter,
  resolveEventNearestDateInYear,
  resolveEventNearestDayOfMonth,
  resolveEventNearestDayOfWeek,
  resolveEventNearestDayOfWeekInMonth,
  resolveEventNearestDayOfWeekInYear,
  resolveEventNearestDayOfWeekOfMonthInYear,
  resolveEventNearestTimeOfDay,
} from './nextProcessItem.js'

export const resolveProcessItemSchedule = (
  predecessorEndsAt: Date,
  timezone: string,
  processItemOffset: types.ProcessItemOffsetSpec,
) => {
  switch (processItemOffset.type) {
    case 'immediatellyAfter':
      return resolveEventImmediatellyAfter(
        predecessorEndsAt,
        timezone,
        processItemOffset.gapHours,
        processItemOffset.gapMinutes,
      )
    case 'nearestTimeOfDay':
      return resolveEventNearestTimeOfDay(
        predecessorEndsAt,
        timezone,
        processItemOffset.hour,
        processItemOffset.minute,
        processItemOffset.gapDays,
      )
    case 'nearestDayOfWeek':
      return resolveEventNearestDayOfWeek(
        predecessorEndsAt,
        timezone,
        processItemOffset.dayOfWeek,
        processItemOffset.hour,
        processItemOffset.minute,
        processItemOffset.gapWeeks,
      )
    case 'nearestDayOfWeekInMonth':
      return resolveEventNearestDayOfWeekInMonth(
        predecessorEndsAt,
        timezone,
        processItemOffset.weekOfMonth,
        processItemOffset.dayOfWeek,
        processItemOffset.hour,
        processItemOffset.minute,
        processItemOffset.gapMonths,
      )
    case 'nearestDayOfMonth':
      return resolveEventNearestDayOfMonth(
        predecessorEndsAt,
        timezone,
        processItemOffset.dayOfMonth,
        processItemOffset.hour,
        processItemOffset.minute,
        processItemOffset.gapMonths,
      )
    case 'nearestDayOfWeekOfMonthInYear':
      return resolveEventNearestDayOfWeekOfMonthInYear(
        predecessorEndsAt,
        timezone,
        processItemOffset.month,
        processItemOffset.weekOfMonth,
        processItemOffset.dayOfWeek,
        processItemOffset.hour,
        processItemOffset.minute,
        processItemOffset.gapYears,
      )
    case 'nearestDayOfWeekInYear':
      return resolveEventNearestDayOfWeekInYear(
        predecessorEndsAt,
        timezone,
        processItemOffset.weekOfYear,
        processItemOffset.dayOfWeek,
        processItemOffset.hour,
        processItemOffset.minute,
        processItemOffset.gapYears,
      )
    case 'nearestDateOfYear':
      return resolveEventNearestDateInYear(
        predecessorEndsAt,
        timezone,
        processItemOffset.dayOfYear.month,
        processItemOffset.dayOfYear.month,
        processItemOffset.hour,
        processItemOffset.minute,
        processItemOffset.gapYears,
      )
  }
}
