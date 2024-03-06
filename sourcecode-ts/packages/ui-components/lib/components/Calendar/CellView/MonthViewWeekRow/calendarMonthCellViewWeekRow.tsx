import clsx from 'clsx'
import { WeekGridLayout } from '../MonthGridLayout/calendarMonthCellViewGridLayout'
import { CalendarEventProvider, useCalendarEventContext } from '../../../../context/calendarEvent'
import { useState } from 'react'
import {
  calendarRangeIdentifier,
  compressedIntervalMatrix,
  eventFmt,
  pluralizeByCount,
  zonedRangeInterval,
} from '@calendar-from-cli/calendar-utils'
import { CalendarEvent as CalendarEventComponent } from '../../../CalendarEvent/calendarEvent'
import { useCalendarViewContext } from '../../../../context/calendarView'
import { calendarDaysOfWeek } from '../../../../constants'
import { addDays } from 'date-fns'
import { types } from '@calendar-from-cli/validation-lib'

type CalendarEvent = ReturnType<typeof useCalendarEventContext>

type DayOfYear = Omit<Extract<types.CalendarRangeIdentifier, { type: 'dayLaneView' }>['identifier'], 'year'>

const preprocessCalendarEvents = (
  calendarEvents: CalendarEvent[],
  weekRangeStart: Date,
  weekRangeEnd: Date,
  timezone: string,
) => {
  // 1. trim weeks + apply trimming to the resolved event
  // Elaboration: if event starts before start of rendered week, event will be split in two (or more)
  const calendarEventsWithTrimmedWeek = calendarEvents
    .filter((calendarEvent) => calendarEvent.endsAt > weekRangeStart && calendarEvent.startsAt < weekRangeEnd)
    .map((calendarEvent) => {
      const isTrimmedAtStart = calendarEvent.startsAt < weekRangeStart
      const isTrimmedAtEnd = calendarEvent.endsAt > weekRangeEnd
      const renderedStart = isTrimmedAtStart ? weekRangeStart : calendarEvent.startsAt
      const renderedEnd = isTrimmedAtEnd ? weekRangeEnd : calendarEvent.endsAt
      return {
        isTrimmedAtStart,
        isTrimmedAtEnd,
        renderedStart,
        renderedEnd,
        event: calendarEvent,
      }
    })
    .filter((calendarEvent) => calendarEvent.renderedStart < calendarEvent.renderedEnd)
  // 2. trim months + if an event in a week is part of previous month and current month, split it into 2 events
  let trimmedCalendarEvents = calendarEventsWithTrimmedWeek
  if (weekRangeStart.getMonth() !== weekRangeEnd.getMonth()) {
    const endOfMonth = zonedRangeInterval.createZonedMonthInterval(
      weekRangeStart.getFullYear(),
      weekRangeStart.getMonth(),
      timezone,
    )[1]
    trimmedCalendarEvents = trimmedCalendarEvents.flatMap((calendarEvent) => {
      if (calendarEvent.renderedStart < endOfMonth && endOfMonth < calendarEvent.renderedEnd) {
        return [
          {
            ...calendarEvent,
            renderedEnd: endOfMonth,
          },
          {
            ...calendarEvent,
            renderedStart: endOfMonth,
          },
        ]
      }
      return [calendarEvent]
    })
  }
  const { pushInterval } = compressedIntervalMatrix.createCompressedIntervalMatrix(calendarDaysOfWeek)
  // 3. render intervals on the compressedIntervalMatrix utility data structure
  return trimmedCalendarEvents.map((calendarEvent) => ({
    ...calendarEvent,
    indexInCell: pushInterval(calendarEvent.renderedStart.getDay(), calendarEvent.renderedEnd.getDay()).pushedIndex!,
  }))
}

const findMaxEventIndex = (events: ReturnType<typeof preprocessCalendarEvents>) =>
  [...events].sort((a, b) => b.indexInCell - a.indexInCell)[0]?.indexInCell ?? 0

// * capacity is expected to be gte 1
// * events are expected to be indexed starting from 0
//   * attribute 'indexInCell'
const resolveGridAreasOfMonthViewCalendarDay = (
  calendarEventsInWeek: ReturnType<typeof preprocessCalendarEvents>,
  dayOfWeek: number,
  shouldDisplayAll: boolean,
  capacity: number,
) => {
  const calendarEvents = calendarEventsInWeek
    .map((calendarEvent) => ({
      calendarEvent,
      firstCell: calendarEvent.renderedStart.getDay(),
      lastCell: calendarEvent.renderedEnd.getDay(),
    }))
    .filter(({ firstCell, lastCell }) => firstCell <= dayOfWeek && dayOfWeek <= lastCell)
  const { displayedEvents, remainingEvents } = shouldDisplayAll
    ? {
        displayedEvents: calendarEvents,
        remainingEvents: [] as typeof calendarEvents,
      }
    : {
        displayedEvents: calendarEvents.filter(({ calendarEvent }) => calendarEvent.indexInCell < capacity),
        remainingEvents: calendarEvents.filter(({ calendarEvent }) => calendarEvent.indexInCell >= capacity),
      }

  const eventsToRender = [...displayedEvents].sort((a, b) => a.calendarEvent.indexInCell - b.calendarEvent.indexInCell)
  const calendarDayCellItems = eventsToRender
    .filter(({ firstCell }) => firstCell === dayOfWeek)
    .map(({ calendarEvent, firstCell, lastCell }) => ({
      calendarEvent,
      firstCell,
      lastCell,
      gridStartsAt: calendarEvent.indexInCell + 1,
      widthDays: lastCell - firstCell + 1,
    }))
  return {
    calendarDayCellItems,
    remainingEvents,
  }
}

type Props = {
  month: number
  events: CalendarEvent[]
  weekRangeStart: Date
  weekRangeEnd: Date
  renderingOptions: {
    minCalendarEventHeightPx: number
    minimumDayCellCapacity: number
  }
  onDayLabelClick: (dayIdentifier: Extract<types.CalendarRangeIdentifier, { type: 'dayLaneView' }>) => void
  now: Date
}

// Note - Use case for week component
// Events that incidentally last more weeks are split in the UI to 2 events
export const MonthCellViewWeekRow = ({
  month,
  events,
  onDayLabelClick,
  weekRangeStart,
  weekRangeEnd,
  renderingOptions,
}: Props) => {
  const [shouldDisplayAllEvents, setShouldDisplayAllEvents] = useState(false)
  const { ctx, utils } = useCalendarViewContext()
  const { now } = ctx
  const calendarEvents = preprocessCalendarEvents(events, weekRangeStart, weekRangeEnd, utils.timezone)
  const renderedCellCapacity = shouldDisplayAllEvents
    ? findMaxEventIndex(calendarEvents) + 1
    : renderingOptions.minimumDayCellCapacity
  return (
    <WeekGridLayout>
      {Array.from({ length: calendarDaysOfWeek })
        .fill(null)
        .map((_, dayIndex) => {
          const { calendarDayCellItems, remainingEvents } = resolveGridAreasOfMonthViewCalendarDay(
            calendarEvents,
            dayIndex,
            shouldDisplayAllEvents,
            renderingOptions.minimumDayCellCapacity,
          )
          const isRenderingAboveConfiguredCapacity = calendarEvents.some(
            (event) => event.indexInCell >= renderingOptions.minimumDayCellCapacity,
          )
          const renderedDay = addDays(weekRangeStart, dayIndex)
          const isToday =
            renderedDay.getFullYear() === now.getFullYear() &&
            renderedDay.getMonth() === now.getMonth() &&
            renderedDay.getDate() === now.getDate()
          const isDayFromDifferentMonth = renderedDay.getMonth() !== month
          const isDayAccessibleByUser =
            !isDayFromDifferentMonth &&
            utils.validateCanAccessCalendarRangeView({
              type: 'dayLaneView',
              identifier: {
                year: renderedDay.getFullYear(),
                month: renderedDay.getMonth() as DayOfYear['month'],
                dayOfMonth: renderedDay.getDate(),
              },
            })
          const onRenderedDayLabelClick = isDayAccessibleByUser
            ? () => onDayLabelClick(calendarRangeIdentifier.calendarRangeIdentifierFromDate(renderedDay, 'dayLaneView'))
            : undefined
          return (
            <div
              key={`day-${renderedDay.getMonth()}-${renderedDay.getDate()}`}
              className={'border-r border-b border-[var(--theme-color-grid)] flex flex-col'}
            >
              <div
                className={clsx('flex items-center justify-center', {
                  'cursor-pointer': isDayAccessibleByUser,
                })}
                onClick={onRenderedDayLabelClick}
              >
                <div
                  className={clsx('my-2 w-7 h-7 rounded-full flex items-center justify-center', {
                    'bg-highlighted-day': isToday,
                    'font-bold': isToday,
                    'text-[var(--theme-color-font-disabled)]': isDayFromDifferentMonth,
                  })}
                >
                  <span>{renderedDay.getDate()}</span>
                </div>
              </div>
              <div
                className="grid grid-cols-[1fr] gap-y-[3px] h-full"
                style={{
                  gridTemplateRows: `repeat(${renderedCellCapacity + 1}, minmax(0, 1fr))`,
                  minHeight: renderingOptions.minCalendarEventHeightPx * renderingOptions.minimumDayCellCapacity,
                }}
              >
                {calendarDayCellItems.map((calendarDayCellItem, index) => {
                  const { event: calendarEvent } = calendarDayCellItem.calendarEvent
                  const isPast = calendarEvent.endsAt < now
                  const tooltipContent = eventFmt.formatZonedEventDurationWithOverlaps(
                    calendarEvent.startsAt,
                    calendarEvent.endsAt,
                    utils.timezone,
                    now,
                  ).formattedEventDuration
                  return (
                    <CalendarEventProvider value={calendarEvent}>
                      <div
                        className="relative h-full"
                        style={{
                          minHeight: renderingOptions.minCalendarEventHeightPx,
                          gridRow: `${calendarDayCellItem.gridStartsAt} / span 1`,
                        }}
                      >
                        <div
                          key={`event-${renderedDay.getMonth()}-${renderedDay.getDate()}-${index}`}
                          className={clsx('absolute h-full', {
                            'w-[100%]': calendarDayCellItem.widthDays === 1,
                            'w-[calc(200%+1px)]': calendarDayCellItem.widthDays === 2,
                            'w-[calc(300%+2px)]': calendarDayCellItem.widthDays === 3,
                            'w-[calc(400%+3px)]': calendarDayCellItem.widthDays === 4,
                            'w-[calc(500%+4px)]': calendarDayCellItem.widthDays === 5,
                            'w-[calc(600%+5px)]': calendarDayCellItem.widthDays === 6,
                            'w-[calc(700%+6px)]': calendarDayCellItem.widthDays === 7,
                          })}
                        >
                          <CalendarEventComponent
                            isBlurred={calendarEvent.isConcealed}
                            isDampened={isPast}
                            isEventInfoModalEnabled={!calendarEvent.isConcealed}
                            eventTagOptions={{
                              displayOptions: 'center',
                              tooltipDirection: dayIndex === 6 ? 'left' : 'right',
                            }}
                            trimmingOptions={{
                              isTrimmedAtStart: false,
                              isTrimmedAtEnd: false,
                            }}
                            shortEventInfo={{
                              type: 'titleOnly',
                              smType: 'titleOnly',
                              // Note - tooltip isn't expected to be rendered
                              subtitle: tooltipContent,
                            }}
                            eventTooltip={{
                              isEnabled: !calendarEvent.isConcealed,
                              tooltipDirection: 'below',
                              content: tooltipContent,
                            }}
                          />
                        </div>
                      </div>
                    </CalendarEventProvider>
                  )
                })}
                {!shouldDisplayAllEvents && remainingEvents.length > 0 && (
                  <div
                    className={clsx('cursor-pointer flex items-center justify-center text-center')}
                    onClick={() => setShouldDisplayAllEvents(true)}
                    style={{
                      gridRow: `${renderedCellCapacity + 1} / span 1`,
                    }}
                  >
                    <div className="sm:hidden text-sm">{'Show More'}</div>
                    <div className="hidden sm:block text-sm sm:text-normal">
                      {`Show ${remainingEvents.length} more ${pluralizeByCount('event', remainingEvents.length)}`}
                    </div>
                  </div>
                )}
                {shouldDisplayAllEvents && isRenderingAboveConfiguredCapacity && (
                  <div
                    className={clsx(
                      'cursor-pointer flex items-center justify-center text-center text-sm sm:text-normal',
                    )}
                    onClick={() => setShouldDisplayAllEvents(false)}
                    style={{
                      gridRow: `${renderedCellCapacity + 1} / span 1`,
                    }}
                  >
                    {'Show Less'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
    </WeekGridLayout>
  )
}
