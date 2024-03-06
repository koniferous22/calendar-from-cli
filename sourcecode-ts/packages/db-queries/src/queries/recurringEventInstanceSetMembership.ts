import { prisma } from '@calendar-from-cli/prisma'

export const listRecurringEventInstanceSetMembers = async (
  recurringEventInstanceSetId: number,
  fromUTC: Date,
  toUTC: Date,
) => {
  return prisma.recurringEventInstanceSetMembership.findMany({
    include: {
      RecurringEventInstance: {
        include: {
          RecurringEvent: {
            include: {
              EventTag: true,
            },
          },
        },
      },
    },
    where: {
      RecurringEventInstanceSetId: recurringEventInstanceSetId,
      RecurringEventInstance: {
        ScheduledAtUTC: {
          lte: toUTC,
        },
        EndsAtUTC: {
          gte: fromUTC,
        },
        // Note - conversions will be listed as standalone events
        RecurringEventInstanceConversionId: null,
      },
    },
    orderBy: {
      RecurringEventInstance: {
        ScheduledAtUTC: 'asc',
      },
    },
  })
}
