import { zonedRangeInterval } from '@calendar-from-cli/calendar-utils'
import { generalizedListCalendarItems } from './generalizedListCalendarItems.js'
import { GeneralizedListingOptions } from './types.js'

export const listFutureCalendarItemsInDay = async (
  year: number,
  month: number,
  dayOfMonth: number,
  tz: string,
  calendarViewVersion: number,
  options: GeneralizedListingOptions,
) => {
  const [intervalBegin, intervalEnd] = zonedRangeInterval.createFutureZonedDayInterval(year, month, dayOfMonth, tz)
  return generalizedListCalendarItems(intervalBegin, intervalEnd, tz, calendarViewVersion, options)
}

export const listFutureCalendarItemsInWeek = async (
  year: number,
  month: number,
  dayOfMonth: number,
  tz: string,
  calendarViewVersion: number,
  options: GeneralizedListingOptions,
) => {
  const [zonedWeekBegin, zonedWeekEnd] = zonedRangeInterval.createFutureZonedWeekInterval(year, month, dayOfMonth, tz)
  return generalizedListCalendarItems(zonedWeekBegin, zonedWeekEnd, tz, calendarViewVersion, options)
}

export const listFutureCalendarItemsInMonth = async (
  year: number,
  month: number,
  tz: string,
  calendarViewVersion: number,
  options: GeneralizedListingOptions,
) => {
  const [zonedMonthBegin, zonedMonthEnd] = zonedRangeInterval.createFutureZonedMonthInterval(year, month, tz)
  return generalizedListCalendarItems(zonedMonthBegin, zonedMonthEnd, tz, calendarViewVersion, options)
}

export const listFutureCalendarItemsInYear = async (
  year: number,
  tz: string,
  calendarViewVersion: number,
  options: GeneralizedListingOptions,
) => {
  const [zonedYearBegin, zonedYearEnd] = zonedRangeInterval.createFutureZonedYearInterval(year, tz)
  return generalizedListCalendarItems(zonedYearBegin, zonedYearEnd, tz, calendarViewVersion, options)
}
