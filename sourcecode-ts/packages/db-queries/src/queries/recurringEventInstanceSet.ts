import { prisma } from '@calendar-from-cli/prisma'

export const findRecurringEventInstanceSet = async (
  atomicCalendarViewVersionId: number,
  intervalFrom: Date,
  intervalTo: Date,
) => {
  return prisma.recurringEventInstanceSet.findUnique({
    where: {
      AtomicCalendarViewVersionId_IntervalFromUTC_IntervalToUTC: {
        AtomicCalendarViewVersionId: atomicCalendarViewVersionId,
        IntervalFromUTC: intervalFrom,
        IntervalToUTC: intervalTo,
      },
    },
  })
}
