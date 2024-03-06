import clsx from 'clsx'
import { calendarRangeIdentifier, zonedRangeInterval } from '@calendar-from-cli/calendar-utils'
import { TimesIcon } from '../../icons/Times/times'
import { ToggleButtonGroup } from '../ToggleButtonGroup/toggleButtonGroup'
import { useCalendarViewContext } from '../../context/calendarView'
import { types } from '@calendar-from-cli/validation-lib'

type DayLaneViewRangeIdentifier = Extract<types.CalendarRangeIdentifier, { type: 'dayLaneView' }>
type WeekLaneViewRangeIdentifier = Extract<types.CalendarRangeIdentifier, { type: 'weekLaneView' }>

type Props = {
  isOpen?: boolean
  onSettingsBarClose: () => void
  isPermissionViewSwitchAllowed?: boolean
  timezoneViewSwitchLabels: {
    customOwnerTimezoneLabel?: string
    sameTimezoneText: string
  }
}

const createDayViewIdentifierFromCurrentCalendarRangeView = (
  currentCalendarRangeView: ReturnType<typeof useCalendarViewContext>['ctx']['rangeView'],
  now: Date,
  timezone: string,
): DayLaneViewRangeIdentifier => {
  switch (currentCalendarRangeView.type) {
    case 'dayLaneView':
      return currentCalendarRangeView
    case 'weekLaneView': {
      const [weekIntervalStart, weekIntervalEnd] = zonedRangeInterval.createZonedWeekInterval(
        currentCalendarRangeView.identifier.year,
        currentCalendarRangeView.identifier.month,
        currentCalendarRangeView.identifier.dayOfMonth,
        timezone,
      )
      return now > weekIntervalStart && now < weekIntervalEnd
        ? calendarRangeIdentifier.calendarRangeIdentifierFromDate(now, 'dayLaneView')
        : {
            type: 'dayLaneView',
            identifier: currentCalendarRangeView.identifier,
          }
    }
    case 'monthCellView':
      return now.getFullYear() === currentCalendarRangeView.identifier.year &&
        now.getMonth() === currentCalendarRangeView.identifier.month
        ? calendarRangeIdentifier.calendarRangeIdentifierFromDate(now, 'dayLaneView')
        : ({
            type: 'dayLaneView',
            identifier: {
              ...currentCalendarRangeView.identifier,
              dayOfMonth: 1,
            },
          } as DayLaneViewRangeIdentifier)
  }
}

const createWeekViewIdentifierFromCurrentCalendarRangeView = (
  currentCalendarRangeView: ReturnType<typeof useCalendarViewContext>['ctx']['rangeView'],
  now: Date,
): WeekLaneViewRangeIdentifier => {
  switch (currentCalendarRangeView.type) {
    case 'dayLaneView':
      return {
        type: 'weekLaneView',
        identifier: currentCalendarRangeView.identifier,
      }
    case 'weekLaneView':
      return currentCalendarRangeView
    case 'monthCellView':
      return now.getFullYear() === currentCalendarRangeView.identifier.year &&
        now.getMonth() === currentCalendarRangeView.identifier.month
        ? calendarRangeIdentifier.calendarRangeIdentifierFromDate(now, 'weekLaneView')
        : ({
            type: 'weekLaneView',
            identifier: {
              ...currentCalendarRangeView.identifier,
              dayOfMonth: 1,
            },
          } as WeekLaneViewRangeIdentifier)
  }
}

const createMonthViewIdentifierFromCurrentCalendarRangeView = (
  currentCalendarRangeView: ReturnType<typeof useCalendarViewContext>['ctx']['rangeView'],
) => ({
  type: 'monthCellView' as const,
  identifier: {
    year: currentCalendarRangeView.identifier.year,
    month: currentCalendarRangeView.identifier.month,
  },
})

export const ViewSettingsBar = ({
  isOpen,
  onSettingsBarClose,
  isPermissionViewSwitchAllowed,
  timezoneViewSwitchLabels,
}: Props) => {
  const { ctx, callbacks, utils } = useCalendarViewContext()
  const rangeViewButtons = [
    {
      id: 'dayLaneView' as const,
      label: 'Day',
      onClick: () =>
        callbacks.setRangeView(
          createDayViewIdentifierFromCurrentCalendarRangeView(ctx.rangeView, ctx.now, utils.timezone),
        ),
    },
    {
      id: 'weekLaneView' as const,
      label: 'Week',
      onClick: () =>
        callbacks.setRangeView(createWeekViewIdentifierFromCurrentCalendarRangeView(ctx.rangeView, ctx.now)),
    },
    {
      id: 'monthCellView' as const,
      label: 'Month',
      onClick: () => callbacks.setRangeView(createMonthViewIdentifierFromCurrentCalendarRangeView(ctx.rangeView)),
    },
  ]
  const permissionsViewButtons = [
    {
      id: 'protected' as const,
      label: 'Private',
      onClick: () =>
        callbacks.setPermissionsView({
          type: 'protected',
        }),
    },
    {
      id: 'public' as const,
      label: 'Public',
      onClick: () =>
        callbacks.setPermissionsView({
          type: 'public',
        }),
    },
  ]
  const timezoneViewButtons = [
    {
      id: 'ownerTimezone' as const,
      label: timezoneViewSwitchLabels.customOwnerTimezoneLabel ?? 'Owner Timezone',
      onClick: () =>
        callbacks.setTimezoneView({
          type: 'ownerTimezone',
        }),
    },
    {
      id: 'clientTimezone' as const,
      label: 'My Timezone',
      onClick: () =>
        callbacks.setTimezoneView({
          type: 'clientTimezone',
        }),
    },
  ]
  const isViewingInSameTimezone =
    (ctx.timezoneView.type === 'ownerTimezone' || ctx.timezoneView.type === 'clientTimezone') &&
    utils.isClientFromSameTimezone
  return (
    <>
      {isOpen && (
        <div
          className="sm:fixed inset-0 bg-[var(--theme-color-background-contrast)] opacity-10 z-50"
          onClick={onSettingsBarClose}
        />
      )}
      <div
        className={clsx(
          'fixed overflow-y-scroll sm:overflow-y-visible top-0 left-0 w-full flex items-center justify-end z-50 transition-all duration-300 origin-top',
          {
            'scale-y-100': isOpen,
            'max-h-screen': isOpen,
            'scale-y-0': !isOpen,
            'max-h-0': !isOpen,
          },
        )}
      >
        <div className={'w-full relative bg-[var(--theme-color-background-section)] p-8 shadow-lg'}>
          <div className="flex flex-col xl:flex-row xl:justify-center gap-5 items-center md:mr-6">
            <div className="min-w-full sm:min-w-[450px]">
              <ToggleButtonGroup
                activeButton={rangeViewButtons.findIndex(({ id }) => id === ctx.rangeView.type)}
                title="Switch Day/Week/Month View"
                // rangeViewButtons - length 3
                buttons={rangeViewButtons as any}
              />
            </div>
            {isPermissionViewSwitchAllowed && (
              <div className="min-w-full sm:min-w-[300px]">
                <ToggleButtonGroup
                  activeButton={permissionsViewButtons.findIndex(({ id }) => id === ctx.permissionsView.type)}
                  title="Switch Public/Private View"
                  // permissionsViewButtons - length 2
                  buttons={permissionsViewButtons as any}
                />
              </div>
            )}
            {!isViewingInSameTimezone && (
              <div className="min-w-full sm:min-w-[350px]">
                <ToggleButtonGroup
                  activeButton={
                    ctx.timezoneView.type === 'custom'
                      ? null
                      : timezoneViewButtons.findIndex(({ id }) => id === ctx.timezoneView.type)
                  }
                  title="Timezone"
                  // timezoneViewButtons - length 2
                  buttons={timezoneViewButtons as any}
                />
              </div>
            )}
            {isViewingInSameTimezone && timezoneViewSwitchLabels.sameTimezoneText && (
              <div className="min-w-full sm:min-w-[350px]">{timezoneViewSwitchLabels.sameTimezoneText}</div>
            )}
          </div>
          <button className="absolute top-4 right-4 text-gray-600 hover:text-gray-800" onClick={onSettingsBarClose}>
            <TimesIcon variant="standard" />
          </button>
        </div>
      </div>
    </>
  )
}
