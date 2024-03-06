import { useQuery } from '@tanstack/react-query'
import {
  CalendarDayLaneView,
  CalendarMonthCellView,
  CalendarWeekLaneView,
  hooks,
} from '@calendar-from-cli/ui-components'
import { trpcClient } from '../trpc/trpc'
import { useAppSearchParamsContext } from '../context/AppSearchParams'
import { isLoggedIn as resolveIsLoggedIn } from '../trpc/auth'
import { getConfig } from '../config/config'
import { calendarRangeIdentifier } from '@calendar-from-cli/calendar-utils'

type CalendarEvents = Awaited<ReturnType<typeof trpcClient.calendar.listDayView.query>>

const formatEvent = (event: CalendarEvents[number]): Parameters<typeof CalendarDayLaneView>[0]['events'][number] => {
  switch (event.type) {
    case 'concealedItem':
      return {
        title: event.placeholder,
        startsAt: new Date(event.utcScheduledAt),
        endsAt: new Date(event.utcEndsAt),
        isConcealed: true,
        duration: event.duration,
        eventTag: event.tag,
        eventInfo: null,
      }
    case 'historicProcessEvent':
      return {
        title: event.title,
        startsAt: new Date(event.utcScheduledAt),
        endsAt: new Date(event.utcEndsAt),
        isConcealed: false,
        duration: event.duration,
        eventTag: event.tag,
        eventInfo: {
          type: 'processSnapshot',
          processTitle: event.processStatus.processTitle,
          processItemsCompleted: event.processStatus.processItemsCompleted,
          description: event.description,
          descriptionFormat: event.descriptionFormat,
        },
      }
    case 'processEvent':
      return {
        title: event.title,
        startsAt: new Date(event.utcScheduledAt),
        endsAt: new Date(event.utcEndsAt),
        isConcealed: false,
        duration: event.duration,
        eventTag: event.tag,
        eventInfo: {
          type: 'ongoingProcess',
          eventIndexInProcess: event.processStatus.canonicalItemIndexInProcess,
          processItemsCompleted: event.processStatus.processItemsCompleted,
          processEventCount: event.processStatus.processItemCount,
          processTitle: event.processStatus.processTitle,
          processStartsAtUTC: new Date(event.processStatus.processStartsAtUTC),
          description: event.description,
          descriptionFormat: event.descriptionFormat,
        },
      }
    case 'recurringEvent':
      return {
        title: event.title,
        startsAt: new Date(event.utcScheduledAt),
        endsAt: new Date(event.utcEndsAt),
        isConcealed: false,
        duration: event.duration,
        eventTag: event.tag,
        eventInfo: {
          type: 'recurringEvent',
          recurringSchedule: event.recurringSchedule,
          description: event.description,
          descriptionFormat: event.descriptionFormat,
        },
      }
    default:
      return {
        title: event.title,
        startsAt: new Date(event.utcScheduledAt),
        endsAt: new Date(event.utcEndsAt),
        isConcealed: false,
        duration: event.duration,
        eventTag: event.tag,
        eventInfo: {
          type: 'basic',
          description: event.description,
          descriptionFormat: event.descriptionFormat,
        },
      }
  }
}

const resolveDisplayedPermissionView = (
  isLoggedIn: boolean,
  permissionsView: ReturnType<typeof useAppSearchParamsContext>['permissionsView'],
) => {
  return isLoggedIn && permissionsView === 'protected' ? ('protected' as const) : ('public' as const)
}

export const Calendar = () => {
  const isLoggedIn = resolveIsLoggedIn()
  const { ctx, utils, callbacks } = hooks.useCalendarViewContext()
  const { showLoader, hideLoader } = hooks.useLoaderContext()
  const intervalStart = new Date(utils.calendarRangeInterval.from)
  const displayedPermissionView = resolveDisplayedPermissionView(isLoggedIn, ctx.permissionsView.type)
  const events = useQuery({
    queryKey: ['events', ctx.rangeView, displayedPermissionView, utils.timezone],
    queryFn: async () => {
      let result: CalendarEvents
      showLoader()
      try {
        if (isLoggedIn) {
          switch (ctx.rangeView.type) {
            case 'dayLaneView':
              result = await trpcClient.calendar.listDayView.query({
                ...ctx.rangeView.identifier,
                clientTimezone: utils.timezone,
              })
              break
            case 'weekLaneView':
              result = await trpcClient.calendar.listWeekView.query({
                ...ctx.rangeView.identifier,
                clientTimezone: utils.timezone,
              })
              break
            case 'monthCellView':
              result = await trpcClient.calendar.listMonthView.query({
                ...ctx.rangeView.identifier,
                clientTimezone: utils.timezone,
              })
              break
          }
        } else {
          switch (ctx.rangeView.type) {
            case 'dayLaneView':
              result = await trpcClient.calendar.listPublicDayView.query({
                ...ctx.rangeView.identifier,
                clientTimezone: utils.timezone,
              })
              break
            case 'weekLaneView':
              result = await trpcClient.calendar.listPublicWeekView.query({
                ...ctx.rangeView.identifier,
                clientTimezone: utils.timezone,
              })
              break
            case 'monthCellView':
              result = await trpcClient.calendar.listPublicMonthView.query({
                ...ctx.rangeView.identifier,
                clientTimezone: utils.timezone,
              })
              break
          }
        }
      } finally {
        hideLoader()
      }
      return result
    },
    staleTime: 1000 * getConfig().calendar.calendarDataRefetchFrequencySeconds,
  })

  switch (ctx.rangeView.type) {
    case 'dayLaneView':
      return (
        <CalendarDayLaneView
          identifier={ctx.rangeView.identifier}
          dayOfWeek={intervalStart.getDay()}
          events={(events.data ?? []).map(formatEvent)}
          now={ctx.now}
          renderingOptions={getConfig().calendar.renderingOptions.laneView}
        />
      )
    case 'weekLaneView':
      return (
        <CalendarWeekLaneView
          identifier={ctx.rangeView.identifier}
          navigation={{
            goToDay: {
              type: 'button',
              onClick: (date: Date) => {
                callbacks.setRangeView(calendarRangeIdentifier.calendarRangeIdentifierFromDate(date, 'dayLaneView'))
              },
            },
          }}
          renderingOptions={getConfig().calendar.renderingOptions.laneView}
          events={(events.data ?? []).map(formatEvent)}
        />
      )
    case 'monthCellView':
      return (
        <CalendarMonthCellView
          identifier={ctx.rangeView.identifier}
          navigation={{
            goToDay: {
              type: 'button',
              onClick: (date: Date) => {
                callbacks.setRangeView(calendarRangeIdentifier.calendarRangeIdentifierFromDate(date, 'dayLaneView'))
              },
            },
          }}
          renderingOptions={getConfig().calendar.renderingOptions.cellView}
          events={(events.data ?? []).map(formatEvent)}
        />
      )
  }
}
