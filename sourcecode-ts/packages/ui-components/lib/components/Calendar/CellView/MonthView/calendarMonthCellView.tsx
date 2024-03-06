import clsx from 'clsx'
import { MonthCellViewHeader } from '../MonthHeader/calendarMonthCellViewHeader'
import { MonthCellViewWeekRow } from '../MonthViewWeekRow/calendarMonthCellViewWeekRow'
import { useCalendarViewContext } from '../../../../context/calendarView'
import { calendarRangeInterval, zonedRangeInterval } from '@calendar-from-cli/calendar-utils'
import { useCalendarEventContext } from '../../../../context/calendarEvent'

type Props = {
  identifier: {
    year: number
    month: number
  }
  navigation: {
    goToDay: {
      type: 'button'
      onClick: (date: Date) => void
    }
  }
  events: ReturnType<typeof useCalendarEventContext>[]
  renderingOptions: Parameters<typeof MonthCellViewWeekRow>[0]['renderingOptions']
}

const createWeekRangesFromMonthCalendarRange = (
  monthCalendarRangeStart: Date,
  monthCalendarRangeEnd: Date,
  timezone: string,
) => {
  let result: (readonly [Date, Date])[] = []
  let currentBeginningOfWeek = monthCalendarRangeStart
  while (currentBeginningOfWeek < monthCalendarRangeEnd) {
    const currentWeek = zonedRangeInterval.createZonedWeekInterval(
      currentBeginningOfWeek.getFullYear(),
      currentBeginningOfWeek.getMonth(),
      currentBeginningOfWeek.getDate(),
      timezone,
    )
    result.push(currentWeek)
    // Shift to end of current week / beginning of next week
    currentBeginningOfWeek = currentWeek[1]
  }
  return result
}

export const CalendarMonthCellView = ({ identifier, events, renderingOptions }: Props) => {
  const { year, month } = identifier
  const { ctx, utils, callbacks } = useCalendarViewContext()
  const { timezone } = utils
  const { now } = ctx
  const [monthCalendarRangeStart, monthCalendarRangeEnd] = calendarRangeInterval.createMonthCalendarRangeInterval(
    year,
    month,
    timezone,
  )
  const weekRanges = createWeekRangesFromMonthCalendarRange(monthCalendarRangeStart, monthCalendarRangeEnd, timezone)
  return (
    <>
      <MonthCellViewHeader />
      <div className={clsx('flex flex-col border-t border-l border-[var(--theme-color-grid)]')}>
        {weekRanges.map(([zonedWeekStart, zonedWeekEnd], weekIndex) => {
          const eventsOfTheWeek = events.filter(
            ({ endsAt, startsAt }) => endsAt > zonedWeekStart && startsAt < zonedWeekEnd,
          )
          return (
            <MonthCellViewWeekRow
              key={`week-${weekIndex}`}
              month={month}
              events={eventsOfTheWeek}
              weekRangeStart={zonedWeekStart}
              weekRangeEnd={zonedWeekEnd}
              onDayLabelClick={(dayLaneViewIdentifier) => callbacks.setRangeView(dayLaneViewIdentifier)}
              renderingOptions={renderingOptions}
              now={now}
            />
          )
        })}
      </div>
    </>
  )
}
