import { queries } from '@calendar-from-cli/db-queries'
import { PrismaClientReusableInTransactions, prisma } from '@calendar-from-cli/prisma'
import { compareProcessFieldsWithHistoricProcessSnapshot } from '../process/historicProcessSnapshot.js'
import { TRPCError } from '@trpc/server'

const checkDbItemsAllOlderThan = async (executedAt: Date) => {
  let errors = [] as string[]
  const eventAnomaly = await queries.findFirstEventEndingEarlierThan(executedAt)
  if (eventAnomaly) {
    errors = errors.concat(
      `Found Event with Id ${eventAnomaly.Id} that ended earlier that last execution - ${eventAnomaly.EndsAtUTC} < ${executedAt}`,
    )
  }
  const recurringEventInstanceAnomaly =
    await queries.findFirstUnconvertedRecurringEventInstanceEndingEarlierThan(executedAt)
  if (recurringEventInstanceAnomaly) {
    errors = errors.concat(
      `Found Unconverted Recurring Event Instance with Id ${recurringEventInstanceAnomaly.Id} that ended earlier that last execution - ${recurringEventInstanceAnomaly.EndsAtUTC} < ${executedAt}`,
    )
  }
  const recurringEventInstanceConversionAnomaly =
    await queries.findFirstUnneededRecurringEventInstanceConversion(executedAt)
  if (recurringEventInstanceConversionAnomaly) {
    errors = errors.concat(
      `Found Recurring Event Instance Conversion with Id ${recurringEventInstanceConversionAnomaly.Id} containing references to past event and past (converted) recurring event instance`,
    )
  }
  if (errors.length > 0) {
    return {
      success: false as const,
      errors,
    }
  }
  return {
    success: true as const,
  }
}

// Unneeded = both event schedule and original recurring event instance schedule is in the past
// Elaboration - RecurringEventInstanceConversions are used both as EventSource and as an indicator for RecurringEventInstance that it shouldn't be displayed if it has a conversion attached
const getUnneededRecurringEventInstanceConversionIds = async (pc: PrismaClientReusableInTransactions, now: Date) =>
  queries.transactional
    .findUnneededRecurringEventInstanceConversions(pc, now)
    .then((result) => result.map(({ Id }) => Id))

const removeUnneededRecurringEventInstanceConversionIds = async (
  pc: PrismaClientReusableInTransactions,
  ids: number[],
) => queries.transactional.removeUnneededRecurringEventInstanceCnoversionsByIds(pc, ids)

const migrateEventsFromProcessItems = async (pc: PrismaClientReusableInTransactions, now: Date) => {
  // 1. List events (join event source reference, process item attachment, process)
  // 2. Apply Process Snapshot Logic (described above)
  // 3. Migrate Historic Events
  // 4. Remove ProcessItemAttachment
  // 5. remove event source references
  // 6. remove events
  const eventsToMigrate = await queries.transactional.listEventsFromProcessItemAttachmentEndingEarlierThan(pc, now)
  const historicEventsInput = await Promise.all(
    eventsToMigrate.map(async (migratedEvent) => {
      const calendarProcess = migratedEvent.EventSourceReference.ProcessItemAttachment!.Process
      const { LatestHistoricProcessSnapshotId: historicProcessSnapshotId } = calendarProcess
      if (!historicProcessSnapshotId) {
        const historicProcessSnapshot = await queries.transactional.createHistoricProcessSnapshotFromProcess(
          pc,
          calendarProcess,
          now,
        )
        return {
          historicEventInput: migratedEvent,
          historicProcessSnapshotId: historicProcessSnapshot.Id,
        }
      }
      let historicProcessSnapshot = await queries.transactional.findHistoricProcessSnapshotById(
        pc,
        historicProcessSnapshotId,
      )
      if (!historicProcessSnapshot) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to retrieve historic process snapshot',
        })
      }
      if (!compareProcessFieldsWithHistoricProcessSnapshot(calendarProcess, historicProcessSnapshot)) {
        historicProcessSnapshot = await queries.transactional.createHistoricProcessSnapshotFromProcess(
          pc,
          calendarProcess,
          now,
        )
      }
      return {
        historicEventInput: migratedEvent,
        historicProcessSnapshotId: historicProcessSnapshot.Id,
      }
    }),
  )
  await queries.transactional.createHistoricEventsFromProcessItemAttachmentEvents(pc, historicEventsInput, now)
  const eventSourceReferences = eventsToMigrate.map(({ EventSourceReference }) => EventSourceReference)
  const processItemAttachments = eventSourceReferences.map(({ ProcessItemAttachment }) => ProcessItemAttachment!)
  await queries.transactional.bulkRemoveEventsByIds(
    pc,
    eventsToMigrate.map(({ Id }) => Id),
  )
  await queries.transactional.bulkRemoveEventSourceReferencesByIds(
    pc,
    eventSourceReferences.map(({ Id }) => Id),
  )
  await queries.transactional.bulkRemoveProcessItemAttachmentByIds(
    pc,
    processItemAttachments.map(({ Id }) => Id),
  )
}

const migrateRemainingEventsWithDefaultBehaviour = async (pc: PrismaClientReusableInTransactions, now: Date) => {
  // 1. List events with EventTemplate and Ad-Hoc event source type
  // 2. Migrate Historic Events
  // 3. Remove events
  // 4. Remove event source references
  // Note regarding recurring event instance conversions:
  // * Following are kept (or deleted by function below)
  //   * recurring event instance set memberships
  //   * recurring event instance
  //   * recurring event instance conversions
  const eventsToMigrate = await queries.transactional.listEventsWithEventSourceTypeEndingEarlierThan(
    pc,
    ['AdHoc', 'EventTemplate', 'RecurringEventInstanceConversion'],
    now,
  )
  const eventSourceReferences = eventsToMigrate.map(({ EventSourceReference }) => EventSourceReference)
  await queries.transactional.createHistoricEventsFromEvents(pc, eventsToMigrate, now)
  await queries.transactional.bulkRemoveEventsByIds(
    pc,
    eventsToMigrate.map(({ Id }) => Id),
  )
  await queries.transactional.bulkRemoveEventSourceReferencesByIds(
    pc,
    eventSourceReferences.map(({ Id }) => Id),
  )
}

const migrateRecurringEventInstances = async (pc: PrismaClientReusableInTransactions, now: Date) => {
  // Note - this has to be executed after deleting instances
  // 1. List Recurring Event Instances
  // 2. Migrate Historic Events
  // 3. remove recurring event instance set memberships
  // 4. remove recurring event instances
  const recurringEventInstancesToMigrate = await queries.transactional.listRecurringEventInstancesEndingEarlierThan(
    pc,
    now,
  )
  await queries.transactional.createHistoricEventsFromRecurringEventInstances(pc, recurringEventInstancesToMigrate, now)
  const recurringEventInstanceIds = recurringEventInstancesToMigrate.map(({ Id }) => Id)
  await queries.transactional.bulkRemoveRecurringEventInstanceSetMembershipsByRecurringEventInstanceId(
    pc,
    recurringEventInstanceIds,
  )
  await queries.transactional.bulkRemoveRecurringEventInstancesByIds(pc, recurringEventInstanceIds)
}

type MigratePastOpts = {
  shouldCheckForCorruptDbState: boolean
}

export const migratePast = async ({ shouldCheckForCorruptDbState }: MigratePastOpts) => {
  const now = new Date()
  const migratePastLastRun = await queries.getLatestMigratePastExecution()
  if (migratePastLastRun) {
    if (migratePastLastRun.ExecutedAt > now) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: "Invalid last run of 'migratePast' job",
      })
    }
    if (shouldCheckForCorruptDbState) {
      const lastMigrationResult = await checkDbItemsAllOlderThan(migratePastLastRun.ExecutedAt)
      if (!lastMigrationResult.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Corrupt state - found entries older than last migration run',
        })
      }
    }
  }
  return prisma.$transaction(async (tx) => {
    await migrateEventsFromProcessItems(tx, now)
    const unneededRecurringEventInstanceConversionIds = await getUnneededRecurringEventInstanceConversionIds(tx, now)
    await migrateRemainingEventsWithDefaultBehaviour(tx, now)
    await migrateRecurringEventInstances(tx, now)
    await removeUnneededRecurringEventInstanceConversionIds(tx, unneededRecurringEventInstanceConversionIds)
    // * Appointment Booking = NYI
    // * Integration = NYI
    // Faulty code - throws error as changes haven't been commited, requires refactor
    // if (shouldValidateMigrationResult) {
    //   const migrationResult = await checkDbItemsAllOlderThan(now)
    //   if (!migrationResult.success) {
    //     throw new TRPCError({
    //       code: 'INTERNAL_SERVER_ERROR',
    //       message: `Migration failed - items improperly cleaned up\n${migrationResult.errors.map((err) => `- ${err}`).join('\n')}`,
    //     })
    //   }
    // }
    return queries.transactional.commitNewMigratePastExecution(tx, now)
  })
}
