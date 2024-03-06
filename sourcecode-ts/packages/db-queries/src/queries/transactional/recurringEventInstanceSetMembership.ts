import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'

export const bulkRemoveRecurringEventInstanceSetMembershipsByRecurringEventInstanceId = async (
  pc: PrismaClientReusableInTransactions,
  recurringEventInstanceIds: number[],
) => {
  return pc.recurringEventInstanceSetMembership.deleteMany({
    where: {
      RecurringEventInstanceId: {
        in: recurringEventInstanceIds,
      },
    },
  })
}
