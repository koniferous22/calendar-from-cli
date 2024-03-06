import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'

export const createRecurringEventInstanceSet = async (
  pc: PrismaClientReusableInTransactions,
  atomicCalendarViewVersionId: number,
  from: Date,
  to: Date,
) => {
  return pc.recurringEventInstanceSet.create({
    data: {
      AtomicCalendarViewVersionId: atomicCalendarViewVersionId,
      IntervalFromUTC: from,
      IntervalToUTC: to,
    },
  })
}

export const bulkRemoveOutdadedRecurringEventInstanceSets = async (
  pc: PrismaClientReusableInTransactions,
  atomicCalendarViewVersionId: number,
) => {
  return pc.recurringEventInstanceSet.deleteMany({
    where: {
      OR: [
        {
          RecurringEventInstanceSetMembership: {
            none: {},
          },
        },
        {
          AtomicCalendarViewVersionId: {
            not: {
              equals: atomicCalendarViewVersionId,
            },
          },
        },
      ],
    },
  })
}
