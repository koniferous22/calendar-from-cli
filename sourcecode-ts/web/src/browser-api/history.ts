import { calendarRangeIdentifier } from '@calendar-from-cli/calendar-utils'
import { types } from '@calendar-from-cli/validation-lib'

export const historyPushCalendarRangeView = (rangeIdentifier: types.CalendarRangeIdentifier) => {
  const url = new URL(location.toString())
  url.pathname = calendarRangeIdentifier.calendarRangeIdentifierToPathname(rangeIdentifier)
  history.pushState({}, '', url)
}
