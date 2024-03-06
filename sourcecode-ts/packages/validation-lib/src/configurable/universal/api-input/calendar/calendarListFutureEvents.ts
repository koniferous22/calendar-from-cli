import { utcToZonedTime } from 'date-fns-tz'
import {
  createZCalendarListEventsInDayInput,
  createZCalendarListEventsInMonthInput,
  createZCalendarListEventsInWeekInput,
  createZCalendarListEventsInYearInput,
} from './calendarListEvents.js'

type CheckDateAgainstZonedDateInput = {
  year: number
  month?: number
  dayOfMonth?: number
}

const checkDateAgainstZonedDate = (
  { year, month, dayOfMonth }: CheckDateAgainstZonedDateInput,
  tz: string,
  zonedDate: Date,
) => {
  if (year !== zonedDate.getFullYear()) {
    return year > zonedDate.getFullYear()
  }
  if (!month) {
    return true
  }

  if (month !== zonedDate.getMonth()) {
    return month > zonedDate.getMonth()
  }
  if (!dayOfMonth) {
    return true
  }
  return dayOfMonth >= zonedDate.getDate()
}

const checkDateAgainstCurrentZonedDate = (input: CheckDateAgainstZonedDateInput, tz: string) => {
  const now = new Date()
  const currentZonedTime = utcToZonedTime(now, tz)
  return checkDateAgainstZonedDate(input, tz, currentZonedTime)
}

// NOTE - this might not be correctly implemented as it doesn't take into account weeks beginning at Monday, etc.
const checkDateAgainstZonedBeginningOfTheWeek = (input: CheckDateAgainstZonedDateInput, tz: string) => {
  const beginningOfTheWeek = new Date()
  beginningOfTheWeek.setUTCDate(beginningOfTheWeek.getUTCDate() - beginningOfTheWeek.getUTCDay())
  const zonedBeginningOfTheWeek = utcToZonedTime(beginningOfTheWeek, tz)
  return checkDateAgainstZonedDate(input, tz, zonedBeginningOfTheWeek)
}

const formatMonth = (month: number) => {
  return (
    [
      'January',
      'Febraury',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ][month] ?? month.toString()
  )
}

export const createZCalendarListFutureEventsInDayInput = (
  lowerYearLimit: number,
  maxFutureYearLimit: number,
  userTimezone: string,
) =>
  createZCalendarListEventsInDayInput(lowerYearLimit, maxFutureYearLimit, userTimezone).refine(
    (rangeInput) => checkDateAgainstCurrentZonedDate(rangeInput, rangeInput.clientTimezone),
    ({ year, month, dayOfMonth, clientTimezone }) => ({
      message: `Year: "${year}"; Month: "${formatMonth(
        month,
      )}"; Date: "${dayOfMonth}" resolves to past date in "${clientTimezone}" timezone`,
    }),
  )

export const createZCalendarListFutureEventsInWeekInput = (
  lowerYearLimit: number,
  maxFutureYearLimit: number,
  userTimezone: string,
) =>
  createZCalendarListEventsInWeekInput(lowerYearLimit, maxFutureYearLimit, userTimezone).refine(
    (rangeInput) => checkDateAgainstZonedBeginningOfTheWeek(rangeInput, rangeInput.clientTimezone),
    ({ year, month, dayOfMonth, clientTimezone }) => ({
      message: `Year: "${year}"; Month: "${formatMonth(
        month,
      )}"; Date: "${dayOfMonth}" resolves to past week in "${clientTimezone}" timezone`,
    }),
  )

export const createZCalendarListFutureEventsInMonthInput = (
  lowerYearLimit: number,
  maxFutureYearLimit: number,
  userTimezone: string,
) =>
  createZCalendarListEventsInMonthInput(lowerYearLimit, maxFutureYearLimit, userTimezone).refine(
    (rangeInput) => checkDateAgainstCurrentZonedDate(rangeInput, rangeInput.clientTimezone),
    ({ year, month }) => ({
      message: `Year: "${year}"; Month: "${formatMonth(month)}" resolves to past month in "${userTimezone}" timezone`,
    }),
  )

export const createZCalendarListFutureEventsInYearInput = (
  lowerYearLimit: number,
  maxFutureYearLimit: number,
  userTimezone: string,
) =>
  createZCalendarListEventsInYearInput(lowerYearLimit, maxFutureYearLimit, userTimezone).refine(
    (rangeInput) => checkDateAgainstCurrentZonedDate(rangeInput, rangeInput.clientTimezone),
    ({ year }) => ({
      message: `Year: "${year}" resolves to past month in "${userTimezone}" timezone`,
    }),
  )
