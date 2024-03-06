import { calculateDSTAdjustedTimeOffsetInDays } from '../date/dst.js'
import { createZonedDayInterval } from '../intervals/zonedRange.js'

export const calculateEndsAtFromBeginAndDuration = (begin: Date, durationInMinutes: number) =>
  new Date(begin.getTime() + durationInMinutes * 60 * 1000)

export const millisecondsToMinutes = (milliseconds: number) => Math.floor(milliseconds / (60 * 1000))

export const timeDiffInMinutes = (laterTimestamp: Date, earlierTimestamp: Date) =>
  millisecondsToMinutes(laterTimestamp.getTime() - earlierTimestamp.getTime())

export const timeDiffInZonedCalendarDays = (laterTimestamp: Date, earlierTimestamp: Date, tz: string) => {
  const [zonedLaterBeginOfDay] = createZonedDayInterval(
    laterTimestamp.getFullYear(),
    laterTimestamp.getMonth(),
    laterTimestamp.getDate(),
    tz,
  )
  const [zonedEarlierBeginOfDay] = createZonedDayInterval(
    earlierTimestamp.getFullYear(),
    earlierTimestamp.getMonth(),
    earlierTimestamp.getDate(),
    tz,
  )
  const trimUtcHours = (date: Date) => {
    const result = new Date(date)
    result.setUTCHours(0, 0, 0, 0)
    return result
  }

  return calculateDSTAdjustedTimeOffsetInDays(
    trimUtcHours(zonedEarlierBeginOfDay),
    trimUtcHours(zonedLaterBeginOfDay),
    tz,
  ).days
}
