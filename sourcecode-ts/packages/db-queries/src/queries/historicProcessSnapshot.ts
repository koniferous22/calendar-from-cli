import { prisma } from '@calendar-from-cli/prisma'

export const listHistoricProcessSnapshotsByIds = (historicEventSnapshotIds: number[]) => {
  return prisma.historicProcessSnapshot.findMany({
    include: {
      HistoricEvent: true,
    },
    where: {
      Id: {
        in: historicEventSnapshotIds,
      },
    },
  })
}
