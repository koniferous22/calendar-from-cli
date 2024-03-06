import { zonedRangeInterval } from '@calendar-from-cli/calendar-utils'
import { generalizedListCalendarItems } from './generalizedListCalendarItems.js'
import { GeneralizedListingOptions } from './types.js'

export const listCalendarItemsInDay = async (
  year: number,
  month: number,
  dayOfMonth: number,
  tz: string,
  calendarViewVersion: number,
  options: GeneralizedListingOptions,
) => {
  const [zonedDayBegin, zonedDayEnd] = zonedRangeInterval.createZonedDayInterval(year, month, dayOfMonth, tz)
  return generalizedListCalendarItems(zonedDayBegin, zonedDayEnd, tz, calendarViewVersion, options)
}

export const listCalendarItemsInWeek = async (
  year: number,
  month: number,
  dayOfMonth: number,
  tz: string,
  calendarViewVersion: number,
  options: GeneralizedListingOptions,
) => {
  const [zonedWeekBegin, zonedWeekEnd] = zonedRangeInterval.createZonedWeekInterval(year, month, dayOfMonth, tz)
  return generalizedListCalendarItems(zonedWeekBegin, zonedWeekEnd, tz, calendarViewVersion, options)
}

export const listCalendarItemsInMonth = async (
  year: number,
  month: number,
  tz: string,
  calendarViewVersion: number,
  options: GeneralizedListingOptions,
) => {
  const [zonedMonthBegin, zonedMonthEnd] = zonedRangeInterval.createZonedMonthInterval(year, month, tz)
  return generalizedListCalendarItems(zonedMonthBegin, zonedMonthEnd, tz, calendarViewVersion, options)
}

export const listCalendarItemsInYear = async (
  year: number,
  tz: string,
  calendarViewVersion: number,
  options: GeneralizedListingOptions,
) => {
  const [zonedYearBegin, zonedYearEnd] = zonedRangeInterval.createZonedYearInterval(year, tz)
  return generalizedListCalendarItems(zonedYearBegin, zonedYearEnd, tz, calendarViewVersion, options)
}
