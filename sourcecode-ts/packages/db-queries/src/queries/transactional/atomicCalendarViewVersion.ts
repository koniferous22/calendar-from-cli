import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'

export const getLatestCalendarViewVersion = async (pc: PrismaClientReusableInTransactions) => {
  return pc.atomicCalendarViewVersion.findFirst({
    select: {
      Id: true,
      UpdatedAt: true,
    },
    orderBy: {
      UpdatedAt: 'desc',
    },
  })
}

export const incrementCalendarViewVersion = async (pc: PrismaClientReusableInTransactions) => {
  const now = new Date()
  return pc.atomicCalendarViewVersion.create({
    data: {
      UpdatedAt: now,
    },
  })
}

export const bulkRemoveOlderCalendarViewVersionThan = async (
  pc: PrismaClientReusableInTransactions,
  olderThan: Date,
) => {
  return pc.atomicCalendarViewVersion.deleteMany({
    where: {
      UpdatedAt: {
        lt: olderThan,
      },
    },
  })
}

export const getOldestReferencedCalendarViewVersion = async (pc: PrismaClientReusableInTransactions) => {
  return pc.atomicCalendarViewVersion.findFirst({
    select: {
      Id: true,
      UpdatedAt: true,
    },
    where: {
      OR: [
        {
          RecurringEventInstance: {
            some: {},
          },
        },
        {
          RecurringEventInstanceSet: {
            some: {},
          },
        },
      ],
    },
    orderBy: {
      UpdatedAt: 'asc',
    },
  })
}
