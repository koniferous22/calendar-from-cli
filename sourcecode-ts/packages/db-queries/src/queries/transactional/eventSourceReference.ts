import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'

export const bulkRemoveEventSourceReferencesByIds = (pc: PrismaClientReusableInTransactions, ids: number[]) => {
  return pc.eventSourceReference.deleteMany({
    where: {
      Id: {
        in: ids,
      },
    },
  })
}
