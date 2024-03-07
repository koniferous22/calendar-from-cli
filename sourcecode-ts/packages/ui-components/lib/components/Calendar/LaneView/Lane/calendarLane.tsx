import clsx from 'clsx'
import { datePreprocessing, duration, eventFmt, eventIntervalAreas } from '@calendar-from-cli/calendar-utils'
import { calendarLaneViewHours, calendarMinutesInDay } from '../../../../constants'
import { CalendarEvent } from '../../../CalendarEvent/calendarEvent'
import { CalendarLaneViewCurrentTimeMarker } from '../CurrentTimeMarker/calendarLaneViewCurrentTimeMarker'
import { ConflictArea } from '../../../ConflictArea/conflictArea'
import { Tooltip } from '../../../Tooltip/Generic/genericTooltip'
import { useCalendarViewContext } from '../../../../context/calendarView'
import { CalendarEventProvider, useCalendarEventContext } from '../../../../context/calendarEvent'
import { CalendarEventShortLaneViewInfo } from '../../../CalendarEvent/ShortLaneViewInfo/calendarEventDisplayedLaneViewInfo'
import { ConflictAreaProvider } from '../../../../context/conflictArea'
import { types } from '@calendar-from-cli/validation-lib'
import { useLoaderContext } from '../../../../context/loader'

type TooltipDirection = Parameters<typeof Tooltip>[0]['direction']

type CalendarEventDisplayedInfoType = Parameters<typeof CalendarEventShortLaneViewInfo>[0]['type']

type RenderingOptions = {
  itemBreakpointsInMinutes: {
    minLengthForDisplayTitle: number
    minLengthForDisplayDuration: number
  }
  eventSizeResolution: types.EventUiSizeResolution
  eventInfo: {
    maxAllowedShortEventInfo: CalendarEventDisplayedInfoType
    smMaxAllowedShortEventInfo: CalendarEventDisplayedInfoType
  }
  tooltipDirection: {
    event: TooltipDirection
    eventTag: TooltipDirection
    conflictArea: TooltipDirection
  }
}

type CalendarEvent = ReturnType<typeof useCalendarEventContext>

type CalendarEventTrimmingOptions =
  | {
      isTrimmed: false
    }
  | {
      isTrimmed: true
      trimmedIntervalStart: Date
      trimmedIntervalEnd: Date
    }

// Note - custom function takes care of edge cases such as DST
// Elaboration: when time shifts during DST, by hour, it can affect event size
// * 1 hour long event, can be transformed to length 0 or 2 hours
const resolveCalendarIntervalSize = (
  event: CalendarEvent,
  laneBaseline: Date,
  trimmingOptions: CalendarEventTrimmingOptions,
  calendarEventSizeResolution: RenderingOptions['eventSizeResolution'],
) => {
  if (!trimmingOptions.isTrimmed && calendarEventSizeResolution === 'duration') {
    return event.duration
  }
  const calendarIntervalStart = trimmingOptions.isTrimmed ? trimmingOptions.trimmedIntervalStart : event.startsAt
  const calendarIntervalEnd = trimmingOptions.isTrimmed ? trimmingOptions.trimmedIntervalEnd : event.endsAt
  return (
    duration.timeDiffInMinutes(calendarIntervalEnd, laneBaseline) -
    duration.timeDiffInMinutes(calendarIntervalStart, laneBaseline)
  )
}

const preprocessEvents = (calendarEvents: CalendarEvent[], laneStart: Date, laneEnd: Date) => {
  const laneCalendarEvents = calendarEvents
    .filter((calendarEvent) => calendarEvent.endsAt > laneStart && calendarEvent.startsAt < laneEnd)
    .map((calendarEvent) => {
      const isTrimmedAtStart = calendarEvent.startsAt < laneStart
      const isTrimmedAtEnd = calendarEvent.endsAt > laneEnd
      return {
        isTrimmedAtStart,
        isTrimmedAtEnd,
        calculatedEventLaneStart: isTrimmedAtStart
          ? laneStart
          : datePreprocessing.stripSecondsAndMilliseconds(calendarEvent.startsAt),
        calculatedEventLaneEnd: isTrimmedAtEnd
          ? laneEnd
          : datePreprocessing.stripSecondsAndMilliseconds(calendarEvent.endsAt),
        data: calendarEvent,
      }
    })
    .filter((calendarEvent) => calendarEvent.calculatedEventLaneStart < calendarEvent.calculatedEventLaneEnd)

  const eventIntervalAreaCallbacks: eventIntervalAreas.Callbacks<(typeof laneCalendarEvents)[number], Date> = {
    getIntervalBegin: (event) => event.calculatedEventLaneStart,
    getIntervalEnd: (event) => event.calculatedEventLaneEnd,
    serializeIntervalType: (date) => date.getTime(),
    deserializeIntervalType: (time) => new Date(time),
  }

  return eventIntervalAreas
    .extractIntervalAreas(laneCalendarEvents, eventIntervalAreaCallbacks)
    .map((calendarIntervalArea) => {
      const isEvent = calendarIntervalArea.data.length === 1
      let isTrimmedAtStart = calendarIntervalArea.isTrimmedAtBegin
      if (!isTrimmedAtStart && isEvent) {
        isTrimmedAtStart = calendarIntervalArea.data[0].isTrimmedAtStart
      }
      let isTrimmedAtEnd = calendarIntervalArea.isTrimmedAtEnd
      if (!isTrimmedAtEnd && isEvent) {
        isTrimmedAtEnd = calendarIntervalArea.data[0].isTrimmedAtEnd
      }
      return calendarIntervalArea.data.length > 1
        ? {
            type: 'conflictArea' as const,
            renderedStart: calendarIntervalArea.begin,
            renderedEnd: calendarIntervalArea.end,
            isTrimmedAtStart,
            isTrimmedAtEnd,
            data: calendarIntervalArea.data.map(({ data }) => data) as any as [
              CalendarEvent,
              CalendarEvent,
              ...CalendarEvent[],
            ],
          }
        : {
            type: 'calendarEvent' as const,
            renderedStart: calendarIntervalArea.begin,
            renderedEnd: calendarIntervalArea.end,
            isTrimmedAtStart,
            isTrimmedAtEnd,
            data: calendarIntervalArea.data[0].data,
          }
    })
}

const resolveRenderedEventSizeCategory = (
  calculatedEventHeightInMinutes: number,
  renderingOptions: RenderingOptions,
) => {
  if (calculatedEventHeightInMinutes > renderingOptions.itemBreakpointsInMinutes.minLengthForDisplayDuration) {
    return 'normal' as const
  }
  if (calculatedEventHeightInMinutes > renderingOptions.itemBreakpointsInMinutes.minLengthForDisplayTitle) {
    return 'small' as const
  }
  return 'almostInvisible' as const
}

const resolveShortEventInfoTypes = (
  sizeCategory: ReturnType<typeof resolveRenderedEventSizeCategory>,
  maxAllowedShortEventInfo: CalendarEventDisplayedInfoType,
) => {
  switch (sizeCategory) {
    case 'almostInvisible':
      return 'nothing' as const
    case 'small':
      switch (maxAllowedShortEventInfo) {
        case 'nothing':
          return 'nothing' as const
        default:
          return 'titleOnly' as const
      }
    case 'normal':
      return maxAllowedShortEventInfo
  }
}
const resolveCalendarEventProps = (
  calendarEventArea: Extract<ReturnType<typeof preprocessEvents>[number], { type: 'calendarEvent' }>,
  renderingOptions: RenderingOptions,
  calculatedEventHeightMinutes: number,
  timezone: string,
  now: Date,
): Parameters<typeof CalendarEvent>[0] => {
  const { data } = calendarEventArea
  const isPast = calendarEventArea.renderedEnd < now
  const isBlurred = data.isConcealed
  const isDampened = isPast
  const trimmingOptions = {
    isTrimmedAtStart: calendarEventArea.isTrimmedAtStart,
    isTrimmedAtEnd: calendarEventArea.isTrimmedAtEnd,
  }
  const sizeCategory = resolveRenderedEventSizeCategory(calculatedEventHeightMinutes, renderingOptions)
  const { formattedEventDuration, dayOverlaps } = eventFmt.formatZonedEventDurationWithOverlaps(
    data.startsAt,
    data.endsAt,
    timezone,
    now,
  )
  const shouldDisplayTooltipsRegardlessOfSize = dayOverlaps > 1
  const eventTagDisplayOptions = (function () {
    if (data.isConcealed) {
      return 'hide' as const
    }
    switch (sizeCategory) {
      case 'almostInvisible':
        return 'hide' as const
      case 'small':
        return 'center' as const
      case 'normal':
        return 'corner' as const
    }
  })()
  const eventTagOptions = {
    displayOptions: eventTagDisplayOptions,
    tooltipDirection: renderingOptions.tooltipDirection.eventTag,
  }

  const shortEventInfoType = resolveShortEventInfoTypes(
    sizeCategory,
    renderingOptions.eventInfo.maxAllowedShortEventInfo,
  )
  const smShortEventInfoType = resolveShortEventInfoTypes(
    sizeCategory,
    renderingOptions.eventInfo.smMaxAllowedShortEventInfo,
  )
  const shortEventInfo = {
    type: shortEventInfoType,
    smType: smShortEventInfoType,
    subtitle: formattedEventDuration,
  }
  const eventTooltip: Parameters<typeof CalendarEvent>[0]['eventTooltip'] = shouldDisplayTooltipsRegardlessOfSize
    ? {
        isEnabled: !data.isConcealed,
        tooltipDirection: renderingOptions.tooltipDirection.event,
        content: formattedEventDuration,
      }
    : {
        isEnabled: !data.isConcealed && sizeCategory !== 'normal',
        content: formattedEventDuration,
        tooltipDirection: renderingOptions.tooltipDirection.event,
      }
  const isEventInfoModalEnabled = !data.isConcealed
  return {
    isBlurred,
    isDampened,
    isEventInfoModalEnabled,
    eventTagOptions,
    trimmingOptions,
    shortEventInfo,
    eventTooltip,
  }
}

const resolveConflictAreaProps = (
  conflictArea: Extract<ReturnType<typeof preprocessEvents>[number], { type: 'conflictArea' }>,
  renderingOptions: RenderingOptions,
  now: Date,
): Parameters<typeof ConflictArea>[0] => {
  const isPast = conflictArea.renderedEnd < now
  const isConflictAreaConcealed = conflictArea.data.some((calendarEvent) => calendarEvent.isConcealed)
  const isBlurred = isConflictAreaConcealed
  const isConflictAreaModalEnabled = !isConflictAreaConcealed
  const isDampened = isPast
  const tooltipDirection = renderingOptions.tooltipDirection.conflictArea
  const trimmingOptions = {
    isTrimmedAtStart: conflictArea.isTrimmedAtStart,
    isTrimmedAtEnd: conflictArea.isTrimmedAtEnd,
  }
  return {
    isBlurred,
    isDampened,
    isConflictAreaModalEnabled,
    tooltipDirection,
    trimmingOptions,
  }
}

type Props = {
  laneStart: Date
  laneEnd: Date
  events: CalendarEvent[]
  renderingOptions: RenderingOptions
  shouldContrastLeftBorder?: boolean
}

export const CalendarLane = ({ laneStart, laneEnd, events, renderingOptions, shouldContrastLeftBorder }: Props) => {
  const { isLoading } = useLoaderContext()
  const { ctx, utils } = useCalendarViewContext()
  const { now } = ctx
  const { eventSizeResolution } = renderingOptions
  const preprocessedEvents = preprocessEvents(events, laneStart, laneEnd)
  return (
    <div
      className={clsx('grid-cell relative border-l ', {
        'border-[var(--theme-color-grid-contrast)]': shouldContrastLeftBorder,
        'border-[var(--theme-color-grid)]': !shouldContrastLeftBorder,
      })}
    >
      {Array.from({ length: calendarLaneViewHours + 1 }).map((_, index) => (
        <div
          key={`lane-${laneStart.getDay()}-${index}`}
          className={`${
            index === calendarLaneViewHours ? 'h-0' : 'h-[3rem]'
          } border-t border-[var(--theme-color-grid)]`}
        />
      ))}
      {!isLoading &&
        preprocessedEvents.map((calendarEventArea, index) => {
          const resolveEventSizeTrimmingOptions =
            calendarEventArea.isTrimmedAtStart || calendarEventArea.isTrimmedAtEnd
              ? {
                  isTrimmed: true as const,
                  trimmedIntervalStart: calendarEventArea.renderedStart,
                  trimmedIntervalEnd: calendarEventArea.renderedEnd,
                }
              : {
                  isTrimmed: false as const,
                }
          const calculatedTopOffsetMinutes = duration.timeDiffInMinutes(calendarEventArea.renderedStart, laneStart)
          const calculatedHeightMinutes =
            calendarEventArea.type === 'calendarEvent'
              ? resolveCalendarIntervalSize(
                  calendarEventArea.data,
                  laneStart,
                  resolveEventSizeTrimmingOptions,
                  eventSizeResolution,
                )
              : duration.timeDiffInMinutes(calendarEventArea.renderedEnd, calendarEventArea.renderedStart)
          return (
            <div
              key={`lane-${laneStart.getDay()}-event-${index}`}
              className={'absolute left-0 w-full'}
              style={{
                top: `${(100 * calculatedTopOffsetMinutes) / calendarMinutesInDay}%`,
                height: `${(100 * calculatedHeightMinutes) / calendarMinutesInDay}%`,
              }}
            >
              {calendarEventArea.type === 'calendarEvent' && (
                <CalendarEventProvider value={calendarEventArea.data}>
                  <CalendarEvent
                    {...resolveCalendarEventProps(
                      calendarEventArea,
                      renderingOptions,
                      calculatedHeightMinutes,
                      utils.timezone,
                      now,
                    )}
                  />
                </CalendarEventProvider>
              )}
              {calendarEventArea.type === 'conflictArea' && (
                <ConflictAreaProvider
                  value={{
                    conflictAreaStartsAt: calendarEventArea.renderedStart,
                    conflictAreaEndsAt: calendarEventArea.renderedEnd,
                    events: calendarEventArea.data,
                  }}
                >
                  <ConflictArea {...resolveConflictAreaProps(calendarEventArea, renderingOptions, now)} />
                </ConflictAreaProvider>
              )}
            </div>
          )
        })}
      {now >= laneStart && now <= laneEnd && (
        <div
          className={'absolute left-0 w-full'}
          style={{
            top: `${(100 * duration.timeDiffInMinutes(now, laneStart)) / calendarMinutesInDay}%`,
          }}
        >
          <CalendarLaneViewCurrentTimeMarker />
        </div>
      )}
    </div>
  )
}
