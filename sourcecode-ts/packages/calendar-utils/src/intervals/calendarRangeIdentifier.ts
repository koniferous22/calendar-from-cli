import { addDays, addMonths, addWeeks } from 'date-fns'
import { createMonthCalendarRangeInterval } from './calendarRange.js'
import { createZonedDayInterval, createZonedMonthInterval, createZonedWeekInterval } from './zonedRange.js'
import { types } from '@calendar-from-cli/validation-lib'

type CalendarRangeIdentifier = types.CalendarRangeIdentifier

export const calendarRangeIdentifierFromDate = <T extends CalendarRangeIdentifier['type']>(
  date: Date,
  type: T,
): Extract<CalendarRangeIdentifier, { type: T }> => {
  switch (type) {
    case 'dayLaneView':
      return {
        type: 'dayLaneView',
        identifier: {
          year: date.getFullYear(),
          month: date.getMonth(),
          dayOfMonth: date.getDate(),
        },
      } as unknown as Extract<CalendarRangeIdentifier, { type: T }>
    case 'weekLaneView':
      return {
        type: 'weekLaneView' as const,
        identifier: {
          year: date.getFullYear(),
          month: date.getMonth(),
          dayOfMonth: date.getDate(),
        },
      } as unknown as Extract<CalendarRangeIdentifier, { type: T }>
    case 'monthCellView':
      return {
        type: 'monthCellView' as const,
        identifier: {
          year: date.getFullYear(),
          month: date.getMonth(),
        },
      } as unknown as Extract<CalendarRangeIdentifier, { type: T }>
    default:
      throw new Error(`Invalid 'calendarRangeIdentifier' type: ${type}`)
  }
}

export const calendarRangeIdentifierToInterval = (
  calendarRangeIdentifier: CalendarRangeIdentifier,
  timezone: string,
) => {
  const fmtInterval = ([from, to]: readonly [Date, Date]) => ({
    from,
    to,
  })
  switch (calendarRangeIdentifier.type) {
    case 'dayLaneView':
      return fmtInterval(
        createZonedDayInterval(
          calendarRangeIdentifier.identifier.year,
          calendarRangeIdentifier.identifier.month,
          calendarRangeIdentifier.identifier.dayOfMonth,
          timezone,
        ),
      )
    case 'weekLaneView':
      return fmtInterval(
        createZonedWeekInterval(
          calendarRangeIdentifier.identifier.year,
          calendarRangeIdentifier.identifier.month,
          calendarRangeIdentifier.identifier.dayOfMonth,
          timezone,
        ),
      )
    case 'monthCellView':
      return fmtInterval(
        createMonthCalendarRangeInterval(
          calendarRangeIdentifier.identifier.year,
          calendarRangeIdentifier.identifier.month,
          timezone,
        ),
      )
  }
}

export const calendarRangeIdentifierToPathname = (calendarRangeIdentifier: CalendarRangeIdentifier) => {
  switch (calendarRangeIdentifier.type) {
    case 'dayLaneView':
      return `/day/${calendarRangeIdentifier.identifier.year}/${calendarRangeIdentifier.identifier.month + 1}/${
        calendarRangeIdentifier.identifier.dayOfMonth
      }`
    case 'weekLaneView':
      return `/week/${calendarRangeIdentifier.identifier.year}/${calendarRangeIdentifier.identifier.month + 1}/${
        calendarRangeIdentifier.identifier.dayOfMonth
      }`
    case 'monthCellView':
      return `/month/${calendarRangeIdentifier.identifier.year}/${calendarRangeIdentifier.identifier.month + 1}`
  }
}

export const prevCalendarRangeIdentifier = (
  calendarRangeIdentifier: CalendarRangeIdentifier,
  timezone: string,
): CalendarRangeIdentifier => {
  // const {from: calendarIntervalFrom} =
  switch (calendarRangeIdentifier.type) {
    case 'dayLaneView':
      const prevDayIntervalBegin = addDays(
        createZonedDayInterval(
          calendarRangeIdentifier.identifier.year,
          calendarRangeIdentifier.identifier.month,
          calendarRangeIdentifier.identifier.dayOfMonth,
          timezone,
        )[0],
        -1,
      )
      return {
        type: 'dayLaneView' as const,
        identifier: {
          year: prevDayIntervalBegin.getFullYear(),
          month: prevDayIntervalBegin.getMonth() as Extract<
            CalendarRangeIdentifier,
            { type: 'dayLaneView' }
          >['identifier']['month'],
          dayOfMonth: prevDayIntervalBegin.getDate(),
        },
      }
    case 'weekLaneView':
      const prevWeekIntervalBegin = addWeeks(
        createZonedWeekInterval(
          calendarRangeIdentifier.identifier.year,
          calendarRangeIdentifier.identifier.month,
          calendarRangeIdentifier.identifier.dayOfMonth,
          timezone,
        )[0],
        -1,
      )
      return {
        type: 'weekLaneView',
        identifier: {
          year: prevWeekIntervalBegin.getFullYear(),
          month: prevWeekIntervalBegin.getMonth() as Extract<
            CalendarRangeIdentifier,
            { type: 'weekLaneView' }
          >['identifier']['month'],
          dayOfMonth: prevWeekIntervalBegin.getDate(),
        },
      }
    case 'monthCellView':
      const prevMonthIntervalBegin = addMonths(
        createZonedMonthInterval(
          calendarRangeIdentifier.identifier.year,
          calendarRangeIdentifier.identifier.month,
          timezone,
        )[0],
        -1,
      )
      return {
        type: 'monthCellView',
        identifier: {
          year: prevMonthIntervalBegin.getFullYear(),
          month: prevMonthIntervalBegin.getMonth(),
        },
      }
  }
}

export const nextCalendarRangeIdentifier = (
  calendarRangeIdentifier: CalendarRangeIdentifier,
  timezone: string,
): CalendarRangeIdentifier => {
  const { to: calendarIntervalTo } = calendarRangeIdentifierToInterval(calendarRangeIdentifier, timezone)
  switch (calendarRangeIdentifier.type) {
    case 'dayLaneView':
      return {
        type: 'dayLaneView',
        identifier: {
          year: calendarIntervalTo.getFullYear(),
          month: calendarIntervalTo.getMonth() as Extract<
            CalendarRangeIdentifier,
            { type: 'dayLaneView' }
          >['identifier']['month'],
          dayOfMonth: calendarIntervalTo.getDate(),
        },
      }
    case 'weekLaneView':
      return {
        type: 'weekLaneView',
        identifier: {
          year: calendarIntervalTo.getFullYear(),
          month: calendarIntervalTo.getMonth() as Extract<
            CalendarRangeIdentifier,
            { type: 'weekLaneView' }
          >['identifier']['month'],
          dayOfMonth: calendarIntervalTo.getDate(),
        },
      }
    case 'monthCellView':
      return {
        type: 'monthCellView',
        identifier: {
          year: calendarIntervalTo.getFullYear(),
          month: calendarIntervalTo.getMonth(),
        },
      }
  }
}

export const validateCalendarRangeIdentifierNotPast = (
  calendarRangeIdentifier: CalendarRangeIdentifier,
  timezone: string,
  now: Date,
) => {
  // Note - reason for not reusing 'calendarRangeIdentifierToInterval' is the difference in 'monthCellView'
  // Elaboration - 'monthCellView' should display events outside of month, for example early March events displayed alongside with February events
  // However you shouldn't be able to access February when its 1st of March
  switch (calendarRangeIdentifier.type) {
    case 'dayLaneView':
      return (
        createZonedDayInterval(
          calendarRangeIdentifier.identifier.year,
          calendarRangeIdentifier.identifier.month,
          calendarRangeIdentifier.identifier.dayOfMonth,
          timezone,
        )[1] > now
      )
    case 'weekLaneView':
      return (
        createZonedWeekInterval(
          calendarRangeIdentifier.identifier.year,
          calendarRangeIdentifier.identifier.month,
          calendarRangeIdentifier.identifier.dayOfMonth,
          timezone,
        )[1] > now
      )
    case 'monthCellView':
      return (
        createZonedMonthInterval(
          calendarRangeIdentifier.identifier.year,
          calendarRangeIdentifier.identifier.month,
          timezone,
        )[1] > now
      )
  }
}
