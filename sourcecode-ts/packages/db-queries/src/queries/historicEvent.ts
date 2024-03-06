import { prisma } from '@calendar-from-cli/prisma'

export const listHistoricEvents = async (utcFrom: Date, utcTo: Date) => {
  return prisma.historicEvent.findMany({
    include: {
      HistoricProcessSnapshot: true,
    },
    orderBy: {
      ScheduledAtUTC: 'asc',
    },
    where: {
      ScheduledAtUTC: {
        lte: utcTo,
      },
      EndedAtUTC: {
        gte: utcFrom,
      },
    },
  })
}
