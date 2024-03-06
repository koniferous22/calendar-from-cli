import { queries } from '@calendar-from-cli/db-queries'
import { PrismaClientReusableInTransactions, prisma } from '@calendar-from-cli/prisma'
import { TRPCError } from '@trpc/server'

// Note - this method should ensure idempotency of writes on recurring event instances
const generalizedSyncRecurringEvents = async <ResultT>(
  // Ensures idempotency
  calendarVersionId: number,
  updateData: (pc: PrismaClientReusableInTransactions, newCalendarVersionId: number) => Promise<ResultT>,
) => {
  return prisma.$transaction(async (tx) => {
    const currentCalendarVersionInDb = (await queries.transactional.getLatestCalendarViewVersion(tx))?.Id
    if (currentCalendarVersionInDb !== calendarVersionId) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Provided outdated calendar view version',
      })
    }
    const newCalendarVersion = await queries.transactional.incrementCalendarViewVersion(tx)
    return updateData(tx, newCalendarVersion.Id)
  })
}

type UpdateUnaffectedRecurringEventsOptions = {
  automaticUpdateForUnaffected: {
    recurringEvents: boolean
  }
  shouldCancelConvertedOrphans: boolean
}

type UpdateUnaffectedRecurringEventsWithInstancesOptions = {
  automaticUpdateForUnaffected: {
    recurringEvents: boolean
    recurringEventInstances: boolean
  }
}
export const syncRecurringEvents = async <ResultT>(
  calendarVersionId: number,
  recurringEvent: NonNullable<Awaited<ReturnType<typeof queries.findRecurringEventById>>>,
  updateRecurringEvent: (pc: PrismaClientReusableInTransactions, newCalendarVersionId: number) => Promise<ResultT>,
  options: UpdateUnaffectedRecurringEventsOptions,
): Promise<ResultT> => {
  const now = new Date()
  return generalizedSyncRecurringEvents(calendarVersionId, async (pc, newCalendarVersionId) => {
    const result = await updateRecurringEvent(pc, newCalendarVersionId)
    if (options.automaticUpdateForUnaffected.recurringEvents) {
      await queries.transactional.updateCalendarViewVersionForUnaffectedRecurringEventInstancesByRecurringEventId(
        pc,
        calendarVersionId,
        newCalendarVersionId,
        recurringEvent.Id,
      )
    }
    if (options.shouldCancelConvertedOrphans) {
      // Note - using the old version for modified event - since it hasn't been updated
      const recurringEventInstanceConversionsIds = await queries.transactional.findRecurringEventInstaceConversionIds(
        pc,
        calendarVersionId,
        recurringEvent.Id,
      )
      await queries.transactional.bulkCancelRecurringEventInstanceConversions(
        pc,
        recurringEventInstanceConversionsIds,
        now,
      )
    }
    return result
  })
}

export const syncRecurringEventsWithInstances = async <ResultT>(
  calendarVersionId: number,
  recurringEventInstance: NonNullable<Awaited<ReturnType<typeof queries.findRecurringEventInstanceById>>>,
  updateRecurringEvent: (pc: PrismaClientReusableInTransactions, newCalendarVersionId: number) => Promise<ResultT>,
  options: UpdateUnaffectedRecurringEventsWithInstancesOptions,
): Promise<ResultT> => {
  return generalizedSyncRecurringEvents(calendarVersionId, async (pc, newCalendarVersionId) => {
    const result = await updateRecurringEvent(pc, newCalendarVersionId)
    if (options.automaticUpdateForUnaffected.recurringEventInstances) {
      await queries.transactional.updateCalendarViewVersionForUnaffectedRecurringEventInstancesByRecurringEventInstanceId(
        pc,
        calendarVersionId,
        newCalendarVersionId,
        recurringEventInstance.Id,
      )
    } else if (options.automaticUpdateForUnaffected.recurringEvents) {
      await queries.transactional.updateCalendarViewVersionForUnaffectedRecurringEventInstancesByRecurringEventId(
        pc,
        calendarVersionId,
        newCalendarVersionId,
        recurringEventInstance.RecurringEventId,
      )
    }
    return result
  })
}
