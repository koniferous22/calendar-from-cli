import { timeDiffInZonedCalendarDays } from './duration.js'

const formatDoubleDigit = (number: number) => number.toString().padStart(2, '0')

export const formatZonedEventTime = (timestamp: Date) =>
  `${formatDoubleDigit(timestamp.getHours())}:${formatDoubleDigit(timestamp.getMinutes())}`

export const formatUTCEventTime = (timestamp: Date) =>
  `${formatDoubleDigit(timestamp.getUTCHours())}:${formatDoubleDigit(timestamp.getUTCMinutes())}`

export const formatZonedEventDuration = (startsAt: Date, endsAt: Date) =>
  `${formatZonedEventTime(startsAt)}-${formatZonedEventTime(endsAt)}`

export const formatZonedEventDurationWithOverlaps = (startsAt: Date, endsAt: Date, tz: string, now: Date) => {
  const compareCalendarDates = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  const dayOverlaps = timeDiffInZonedCalendarDays(endsAt, startsAt, tz)
  let formattedEventDuration: string
  if (dayOverlaps < 2) {
    formattedEventDuration = formatZonedEventDuration(startsAt, endsAt)
  } else if (compareCalendarDates(startsAt, now)) {
    formattedEventDuration = `${formatZonedEventTime(startsAt)} - ${endsAt.toLocaleString()}`
  } else if (compareCalendarDates(endsAt, now)) {
    formattedEventDuration = `Started ${startsAt.toLocaleString()} - ${formatZonedEventTime(endsAt)}`
  } else {
    formattedEventDuration = `Started ${startsAt.toLocaleString()}, Ends ${endsAt.toLocaleString()}`
  }
  return {
    formattedEventDuration,
    dayOverlaps,
  }
}
