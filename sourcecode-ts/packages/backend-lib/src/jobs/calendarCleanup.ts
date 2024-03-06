import { queries } from '@calendar-from-cli/db-queries'
import { PrismaClientReusableInTransactions, prisma } from '@calendar-from-cli/prisma'
import { TRPCError } from '@trpc/server'

const resolveOldestReferencedCalendarViewVersion = (pc: PrismaClientReusableInTransactions) =>
  queries.transactional.getOldestReferencedCalendarViewVersion(pc)

const deleteEmptyProcesses = (pc: PrismaClientReusableInTransactions, now: Date) =>
  queries.transactional.bulkRemoveEmptyProcesses(pc, now)

const deleteDanglingRecurringEventInstances = (pc: PrismaClientReusableInTransactions, now: Date) =>
  queries.transactional.bulkRemoveDanglingRecurringEventInstances(pc, now)

// Use case - During migration, Migrated recurring event instances are disassociated from the instance set
// this creates a lot of useless records
const deleteEmptyRecurringEventInstanceSets = (
  pc: PrismaClientReusableInTransactions,
  currentCalendarViewVersionId: number,
) => queries.transactional.bulkRemoveOutdadedRecurringEventInstanceSets(pc, currentCalendarViewVersionId)

const deleteExpiredTrustedViewerGrants = (pc: PrismaClientReusableInTransactions, now: Date) =>
  queries.transactional.bulkRemoveExpiredTrustedViewers(pc, now)

const deleteCalendarViewVersionsOlderThan = (pc: PrismaClientReusableInTransactions, olderThanUTC: Date) =>
  queries.transactional.bulkRemoveOlderCalendarViewVersionThan(pc, olderThanUTC)

const deleteOldMigratePastJobRuns = (pc: PrismaClientReusableInTransactions, mostRecentRunId: number) =>
  queries.transactional.bulkRemoveMigratePastExecutionsExcept(pc, mostRecentRunId)

export const calendarCleanup = async () => {
  const now = new Date()
  const calendarViewVersion = await queries.getLatestCalendarViewVersion()
  if (!calendarViewVersion) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Environment not initialized - Calendar view version record not found',
    })
  }
  const lastMigratePastJobExecution = await queries.getLatestMigratePastExecution()
  return prisma.$transaction(async (tx) => {
    await deleteEmptyProcesses(tx, now)
    await deleteDanglingRecurringEventInstances(tx, now)
    await deleteEmptyRecurringEventInstanceSets(tx, calendarViewVersion.Id)
    await deleteExpiredTrustedViewerGrants(tx, now)
    const oldestReferencedCalendarVersion = await resolveOldestReferencedCalendarViewVersion(tx)
    await deleteCalendarViewVersionsOlderThan(tx, (oldestReferencedCalendarVersion ?? calendarViewVersion).UpdatedAt)
    if (lastMigratePastJobExecution) {
      await deleteOldMigratePastJobRuns(tx, lastMigratePastJobExecution.Id)
    }
    return true
  })
}
