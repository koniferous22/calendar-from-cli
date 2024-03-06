import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'

export const findFirstUnneededRecurringEventInstanceConversion = async (
  pc: PrismaClientReusableInTransactions,
  now: Date,
) => {
  return pc.recurringEventInstanceConversion.findFirst({
    where: {
      RecurringEventInstance: {
        every: {
          EndsAtUTC: {
            lt: now,
          },
        },
      },
      EventSourceReference: {
        every: {
          Event: {
            EndsAtUTC: {
              lt: now,
            },
          },
        },
      },
    },
  })
}

export const findUnneededRecurringEventInstanceConversions = async (
  pc: PrismaClientReusableInTransactions,
  now: Date,
) => {
  return pc.recurringEventInstanceConversion.findMany({
    where: {
      RecurringEventInstance: {
        every: {
          EndsAtUTC: {
            lt: now,
          },
        },
      },
      EventSourceReference: {
        every: {
          Event: {
            EndsAtUTC: {
              lt: now,
            },
          },
        },
      },
    },
  })
}

export const removeUnneededRecurringEventInstanceCnoversionsByIds = async (
  pc: PrismaClientReusableInTransactions,
  ids: number[],
) => {
  return pc.recurringEventInstanceConversion.deleteMany({
    where: {
      Id: {
        in: ids,
      },
    },
  })
}
