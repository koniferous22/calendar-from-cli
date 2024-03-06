import { CalendarHeader as CalendarHeaderComponent, hooks } from '@calendar-from-cli/ui-components'
import { addYears, format } from 'date-fns'
import { getConfig } from '../config/config'
import { types } from '@calendar-from-cli/validation-lib'
import { getAccessTokenPermissions } from '../trpc/auth'

const formatWeekViewMonths = (intervalBegin: Date, intervalEnd: Date) =>
  intervalBegin.getMonth() === intervalEnd.getMonth()
    ? format(intervalBegin, 'MMMM')
    : `${format(intervalBegin, 'MMMM')}-${format(intervalEnd, 'MMMM')}`

const formatCalendarTitle = (
  rangeIdentifier: types.CalendarRangeIdentifier,
  intervalBegin: Date,
  intervalEnd: Date,
) => {
  switch (rangeIdentifier.type) {
    case 'dayLaneView':
      return format(intervalBegin, "MMMM do y '('eeee')'")
    case 'weekLaneView':
      return `${format(intervalBegin, "wo 'week of' y")} - (${formatWeekViewMonths(intervalBegin, intervalEnd)})`
    case 'monthCellView':
      // Interval begin and interval end not used, as calendar views aren't accurate - February view can include events from January
      return format(new Date(rangeIdentifier.identifier.year, rangeIdentifier.identifier.month), 'MMMM y')
  }
}

export const CalendarHeader = () => {
  const { ctx, utils } = hooks.useCalendarViewContext()

  return (
    <CalendarHeaderComponent
      title={formatCalendarTitle(ctx.rangeView, utils.calendarRangeInterval.from, utils.calendarRangeInterval.to)}
      calendarListingLimits={{
        pastBrowsing: !!getAccessTokenPermissions()?.calendarPermissions.canViewPast
          ? {
              enabled: true,
              lowerLimit: new Date(0),
            }
          : {
              enabled: false,
            },
        futureBrowsingUpperLimit: addYears(ctx.now, getConfig().inputValidation.api.calendarList.maxYearsAhead),
      }}
      settingsBar={{
        isPermissionViewSwitchAllowed: !!getAccessTokenPermissions()?.calendarPermissions.canSwitchToPublicView,
        timezoneViewSwitchLabels: {
          customOwnerTimezoneLabel: getConfig().calendar.header.viewSettingsBar.customOwnerTimezoneLabel,
          sameTimezoneText: getConfig().calendar.header.viewSettingsBar.sameTimezoneText,
        },
      }}
      arrowKeyboardEventDebounce={getConfig().calendar.header.arrowKeyboardEventDebounce}
      shouldDisplayLoaderAsHeaderIcon={getConfig().pageLoader === 'headerIcon'}
    />
  )
}
