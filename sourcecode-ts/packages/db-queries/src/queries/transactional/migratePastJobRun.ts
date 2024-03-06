import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'

export const getLatestMigratePastExecution = async (pc: PrismaClientReusableInTransactions) => {
  return pc.migratePastJobRun.findFirst({
    select: {
      Id: true,
      ExecutedAt: true,
    },
    orderBy: {
      ExecutedAt: 'desc',
    },
  })
}

export const commitNewMigratePastExecution = async (pc: PrismaClientReusableInTransactions, executedAt: Date) => {
  return pc.migratePastJobRun.create({
    data: {
      ExecutedAt: executedAt,
    },
  })
}

export const bulkRemoveMigratePastExecutionsExcept = async (pc: PrismaClientReusableInTransactions, id: number) => {
  return pc.atomicCalendarViewVersion.deleteMany({
    where: {
      Id: {
        not: {
          equals: id,
        },
      },
    },
  })
}
