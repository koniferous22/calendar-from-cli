import { CalendarViewProvider } from '../context/calendarView'
import { calendarRangeIdentifier } from '@calendar-from-cli/calendar-utils'

type RangeView = Parameters<typeof CalendarViewProvider>[0]['options']['initialState']['rangeView']
type TimezoneView = Parameters<typeof CalendarViewProvider>[0]['options']['initialState']['timezoneView']

type CreateCalendarViewCtxOptionsOptions = {
  now: Date
  rangeViewType: RangeView['type']
  timezones: {
    ownerTimezone: string
    clientTimezone: string
    initialTimezoneView: TimezoneView
  }
}

export const createCalendarViewCtx = ({
  now,
  rangeViewType,
  timezones,
}: CreateCalendarViewCtxOptionsOptions): Parameters<typeof CalendarViewProvider>[0]['options'] => {
  const rangeView = calendarRangeIdentifier.calendarRangeIdentifierFromDate(now, rangeViewType)
  return {
    resolvers: {
      resolveNow: () => now,
      timezone: {
        resolveOwnerTimezone: () => timezones.ownerTimezone,
        resolveClientTimezone: () => timezones.clientTimezone,
      },
      resolveCanAccessPast: () => true,
    },
    effects: {
      onCalendarPermissionsViewChange: () => {},
      onCalendarRangeViewChanged: () => {},
      onCalendarTimezoneViewChanged: () => {},
    },
    initialState: {
      now,
      rangeView,
      timezoneView: timezones.initialTimezoneView,
      permissionsView: {
        type: 'protected',
      },
    },
  }
}
