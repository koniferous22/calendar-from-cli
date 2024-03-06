import { types } from '@calendar-from-cli/validation-lib'
import { queries, types as dbTypes } from '@calendar-from-cli/db-queries'
import { LoadedProcess } from './types.js'
import {
  createProcessItemScheduleFromProcessItemOffsets,
  createProcessItemScheduleFromResolvedOffsets,
} from './createProcessItemSchedule.js'
import { duration } from '@calendar-from-cli/calendar-utils'
import { prisma } from '@calendar-from-cli/prisma'
import { TRPCError } from '@trpc/server'

type ProcessUpdates = {
  processId: number
  processItemAttachmentIdsToDeactivate: number[]
  processItemAttachmentIdsToIncrementIndex: number[]
  processItemAttachmentIndexAndCalculatedOffsetUpdates: dbTypes.ProcessItemAttachmentIndexAndCalculatedOffsetUpdate[]
  eventIdsToCancel: number[]
  eventsToRescheduleUpdates: dbTypes.ProcessEventRescheduleUpdate[]
  newProcessStartsAt: null | Date
  shouldCancelProcess: boolean
  now: Date
}

const maxItemBy = <T extends {}, OrderingT>(items: T[], selector: (item: T) => OrderingT): T | null => {
  if (items.length === 0) {
    return null
  }
  let maxItem = items[0]
  let maxValue = selector(maxItem)
  for (let i = 1; i < items.length; i++) {
    const currentItem = items[i]
    const currentValue = selector(currentItem)
    if (currentValue > maxValue) {
      maxItem = currentItem
      maxValue = currentValue
    }
  }
  return maxItem
}

const minItemBy = <T extends {}, OrderingT>(items: T[], selector: (item: T) => OrderingT): T | null => {
  if (items.length === 0) {
    return null
  }
  let minItem = items[0]
  let minValue = selector(minItem)
  for (let i = 1; i < items.length; i++) {
    const currentItem = items[i]
    const currentValue = selector(currentItem)
    if (currentValue < minValue) {
      minItem = currentItem
      minValue = currentValue
    }
  }
  return minItem
}

const getProcessItemAttachmentEvent = (processItemAttachment: LoadedProcess['ProcessItemAttachment'][number]) => {
  // Note - [0] indexing used, because of not using partial unique constraints on "EventSourceReference" columns as it's not part of SQL standard
  const event = processItemAttachment.EventSourceReference[0].Event
  if (!event) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unable to resolve process event',
    })
  }
  return event
}

const getActiveProcessItemAttachmentByIndexOrThrow = (processFromDb: LoadedProcess, processItemIndex: number) => {
  const processItemAttachment =
    processFromDb.ProcessItemAttachment.find(
      (processItemAttachment) => processItemAttachment.Index === processItemIndex,
    ) ?? null
  if (!processItemAttachment) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unable to resolve process item attachment',
    })
  }
  if (!processItemAttachment.IsActive) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Inactive process item attachment',
    })
  }
  if (getProcessItemAttachmentEvent(processItemAttachment).EventState !== 'Active') {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Inactive process event',
    })
  }
  return processItemAttachment
}

const resolveAllProcessItemsBeforeByIndex = (processFromDb: LoadedProcess, indexBefore: number) =>
  processFromDb.ProcessItemAttachment.filter(({ Index }) => Index < indexBefore)

const resolveAllProcessItemsAfterByIndex = (processFromDb: LoadedProcess, indexAfter: number) =>
  processFromDb.ProcessItemAttachment.filter(({ Index }) => Index > indexAfter)

const resolveActiveProcessItemsBeforeByIndex = (processFromDb: LoadedProcess, indexBefore: number) =>
  processFromDb.ProcessItemAttachment.filter(({ Index, IsActive }) => IsActive && Index < indexBefore)

const resolveActiveProcessItemsAfterByIndex = (processFromDb: LoadedProcess, indexAfter: number) =>
  processFromDb.ProcessItemAttachment.filter(({ Index, IsActive }) => IsActive && Index > indexAfter)

const resolveAllProcessItemsBeforeByTimestamp = (processFromDb: LoadedProcess, timestamp: Date) =>
  processFromDb.ProcessItemAttachment.filter(
    (processItemAttachment) => getProcessItemAttachmentEvent(processItemAttachment).ScheduledAtUTC < timestamp,
  )

const resolveAllProcessItemsAfterByTimestamp = (processFromDb: LoadedProcess, timestamp: Date) =>
  processFromDb.ProcessItemAttachment.filter(
    (processItemAttachment) => getProcessItemAttachmentEvent(processItemAttachment).ScheduledAtUTC > timestamp,
  )

const resolvePredecessorByIndex = (processFromDb: LoadedProcess, index: number) => {
  const processItemAttachmentsBefore = resolveAllProcessItemsBeforeByIndex(processFromDb, index)
  return maxItemBy(processItemAttachmentsBefore, (processItemAttachment) => processItemAttachment.Index)
}

const resolveSuccessorByIndex = (processFromDb: LoadedProcess, index: number) => {
  const processItemAttachmentsAfter = resolveAllProcessItemsAfterByIndex(processFromDb, index)
  return minItemBy(processItemAttachmentsAfter, (processItemAttachment) => processItemAttachment.Index)
}

const resolvePredecessorByTimestamp = (processFromDb: LoadedProcess, timestamp: Date) => {
  const processItemAttachmentsBefore = resolveAllProcessItemsBeforeByTimestamp(processFromDb, timestamp)
  return maxItemBy(
    processItemAttachmentsBefore,
    (processItemAttachment) => getProcessItemAttachmentEvent(processItemAttachment).ScheduledAtUTC,
  )
}

const resolveSuccessorByTimestamp = (processFromDb: LoadedProcess, timestamp: Date) => {
  const processItemAttachmentsAfter = resolveAllProcessItemsAfterByTimestamp(processFromDb, timestamp)
  return minItemBy(
    processItemAttachmentsAfter,
    (processItemAttachment) => getProcessItemAttachmentEvent(processItemAttachment).ScheduledAtUTC,
  )
}

const resolveActivePredecessorByIndex = (processFromDb: LoadedProcess, index: number) => {
  const processItemAttachmentsBefore = resolveActiveProcessItemsBeforeByIndex(processFromDb, index)
  return maxItemBy(processItemAttachmentsBefore, (processItemAttachment) => processItemAttachment.Index)
}

const resolveActiveSuccessorByIndex = (processFromDb: LoadedProcess, index: number) => {
  const processItemAttachmentsAfter = resolveActiveProcessItemsAfterByIndex(processFromDb, index)
  return minItemBy(processItemAttachmentsAfter, (processItemAttachment) => processItemAttachment.Index)
}

export const resolveCancelProcessItemUpdates = (
  loadedProcess: LoadedProcess,
  processItemIndex: number,
  subsequentProcessItemsBehaviour: types.CancelProcessItemSubsequentProcessItemsBehaviour,
  timezone: string,
): ProcessUpdates => {
  const now = new Date()
  const hasProcessStarted = loadedProcess.StartsAtUTC > now
  const processItemAttachment = getActiveProcessItemAttachmentByIndexOrThrow(loadedProcess, processItemIndex)
  const isCancellingInitialEvent =
    minItemBy(loadedProcess.ProcessItemAttachment, (item) => item.Index)?.Index === processItemIndex
  let processItemAttachmentIdsToDeactivate: ProcessUpdates['processItemAttachmentIdsToDeactivate'] = []
  let processItemAttachmentIdsToIncrementIndex: ProcessUpdates['processItemAttachmentIdsToIncrementIndex'] = []
  let processItemAttachmentIndexAndCalculatedOffsetUpdates: ProcessUpdates['processItemAttachmentIndexAndCalculatedOffsetUpdates'] =
    []
  let eventIdsToCancel: ProcessUpdates['eventIdsToCancel'] = []
  let eventsToRescheduleUpdates: ProcessUpdates['eventsToRescheduleUpdates'] = []
  let newProcessStartsAt: ProcessUpdates['newProcessStartsAt'] = null
  let shouldCancelProcess: ProcessUpdates['shouldCancelProcess'] = false
  switch (subsequentProcessItemsBehaviour) {
    case 'cancelRest':
      const processItemAttachmentsToDeactivate = resolveActiveProcessItemsAfterByIndex(loadedProcess, processItemIndex)
      eventIdsToCancel = processItemAttachmentsToDeactivate.map(
        (processItemAttachment) => getProcessItemAttachmentEvent(processItemAttachment).Id,
      )
      processItemAttachmentIdsToDeactivate = processItemAttachmentsToDeactivate.map(({ Id }) => Id)
      shouldCancelProcess = !hasProcessStarted && isCancellingInitialEvent
      break
    case 'keepInPlace':
      // Update calculated offset for next process event - should take into consideration event before the one being cancelled
      const keepInPlaceSuccessor = resolveActiveSuccessorByIndex(loadedProcess, processItemIndex)
      if (keepInPlaceSuccessor) {
        const keepInPlaceSuccessorEvent = getProcessItemAttachmentEvent(keepInPlaceSuccessor)
        const keepInPlacePredecessor = resolveActivePredecessorByIndex(loadedProcess, processItemIndex)
        const calculatedOffsetReferencePoint = keepInPlacePredecessor
          ? getProcessItemAttachmentEvent(keepInPlacePredecessor).EndsAtUTC
          : loadedProcess.ScheduleBaselineUTC
        const recalculatedOffsetForNextProcessItemMinutes = duration.timeDiffInMinutes(
          keepInPlaceSuccessorEvent.ScheduledAtUTC,
          calculatedOffsetReferencePoint,
        )
        processItemAttachmentIndexAndCalculatedOffsetUpdates.push({
          Id: keepInPlaceSuccessor.Id,
          Index: keepInPlaceSuccessor.Index,
          CalculatedItemOffsetInMinutes: recalculatedOffsetForNextProcessItemMinutes,
        })
        if (!hasProcessStarted && isCancellingInitialEvent) {
          newProcessStartsAt = keepInPlaceSuccessorEvent.ScheduledAtUTC
        }
      }
      break
    case 'preserveCalculatedOffsets':
      // Update calculated offset for next process event - should take into consideration event before the one being cancelled
      const preserveCalculatedOffsetPredecessor = resolveActivePredecessorByIndex(loadedProcess, processItemIndex)
      const preserveCalculatedOffsetsReferencePoint = preserveCalculatedOffsetPredecessor
        ? getProcessItemAttachmentEvent(preserveCalculatedOffsetPredecessor).EndsAtUTC
        : loadedProcess.ScheduleBaselineUTC
      const preserveCalculatedOffsetsAdjustedSchedule = createProcessItemScheduleFromResolvedOffsets(
        preserveCalculatedOffsetsReferencePoint,
        resolveActiveProcessItemsAfterByIndex(loadedProcess, processItemIndex),
        (processItem) => processItem.CalculatedItemOffsetInMinutes,
        (processItem) => processItem.EventSourceReference[0].Event!.Duration,
      )
      eventsToRescheduleUpdates = preserveCalculatedOffsetsAdjustedSchedule.map(({ processItem, scheduledAtUTC }) => {
        const event = getProcessItemAttachmentEvent(processItem)
        return {
          Id: event.Id,
          Duration: event.Duration,
          ScheduledAtUTC: scheduledAtUTC,
        }
      })
      if (!hasProcessStarted && isCancellingInitialEvent) {
        newProcessStartsAt =
          minItemBy(preserveCalculatedOffsetsAdjustedSchedule, (item) => item.processItem.Index)?.scheduledAtUTC ?? null
      }
      break
    case 'reevaluateRelations':
      const reevaluateRelationsPredecessor = resolveActivePredecessorByIndex(loadedProcess, processItemIndex)
      const reevaluateRelationsReferencePoint = reevaluateRelationsPredecessor
        ? getProcessItemAttachmentEvent(reevaluateRelationsPredecessor).EndsAtUTC
        : loadedProcess.ScheduleBaselineUTC
      const reevaluateRelationsAdjustedSchedule = createProcessItemScheduleFromProcessItemOffsets(
        reevaluateRelationsReferencePoint,
        timezone,
        resolveActiveProcessItemsAfterByIndex(loadedProcess, processItemIndex),
        // ? zod validator
        (processItem) => processItem.ItemOffset as any,
        (processItem) => getProcessItemAttachmentEvent(processItem).Duration,
      )
      processItemAttachmentIndexAndCalculatedOffsetUpdates = reevaluateRelationsAdjustedSchedule.map(
        ({ processItem, calculatedOffsetInMinutes }) => ({
          Id: processItem.Id,
          Index: processItem.Index,
          CalculatedItemOffsetInMinutes: calculatedOffsetInMinutes,
        }),
      )
      eventsToRescheduleUpdates = reevaluateRelationsAdjustedSchedule.map(({ processItem, scheduledAtUTC }) => {
        const event = getProcessItemAttachmentEvent(processItem)
        return {
          Id: event.Id,
          Duration: event.Duration,
          ScheduledAtUTC: scheduledAtUTC,
        }
      })
      if (!hasProcessStarted && isCancellingInitialEvent) {
        newProcessStartsAt =
          minItemBy(reevaluateRelationsAdjustedSchedule, (item) => item.processItem.Index)?.scheduledAtUTC ?? null
      }
      break
    default:
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid process item behaviour: ${subsequentProcessItemsBehaviour}`,
      })
  }
  processItemAttachmentIdsToDeactivate = processItemAttachmentIdsToDeactivate.concat(processItemAttachment.Id)
  eventIdsToCancel = eventIdsToCancel.concat(getProcessItemAttachmentEvent(processItemAttachment).Id)
  return {
    processId: loadedProcess.Id,
    processItemAttachmentIdsToDeactivate,
    processItemAttachmentIdsToIncrementIndex,
    processItemAttachmentIndexAndCalculatedOffsetUpdates,
    eventIdsToCancel,
    eventsToRescheduleUpdates,
    newProcessStartsAt,
    shouldCancelProcess,
    now,
  }
}

export const resolveRescheduleProcessItemUpdates = (
  loadedProcess: LoadedProcess,
  processItemIndex: number,
  newScheduledAtUTC: Date,
  newDuration: number,
  subsequentProcessItemsBehaviour: types.RescheduleProcessItemSubsequentProcessItemsBehaviour,
  timezone: string,
): ProcessUpdates => {
  const now = new Date()
  const hasProcessStarted = loadedProcess.StartsAtUTC > now
  const processItemAttachment = getActiveProcessItemAttachmentByIndexOrThrow(loadedProcess, processItemIndex)
  const processItemAttachmentEvent = getProcessItemAttachmentEvent(processItemAttachment)
  let processItemAttachmentIdsToDeactivate: ProcessUpdates['processItemAttachmentIdsToDeactivate'] = []
  let processItemAttachmentIdsToIncrementIndex: ProcessUpdates['processItemAttachmentIdsToIncrementIndex'] = []
  let processItemAttachmentIndexAndCalculatedOffsetUpdates: ProcessUpdates['processItemAttachmentIndexAndCalculatedOffsetUpdates'] =
    []
  let eventIdsToCancel: ProcessUpdates['eventIdsToCancel'] = []
  let eventsToRescheduleUpdates: ProcessUpdates['eventsToRescheduleUpdates'] = []
  let newProcessStartsAt: ProcessUpdates['newProcessStartsAt'] = null
  let shouldCancelProcess: ProcessUpdates['shouldCancelProcess'] = false
  switch (subsequentProcessItemsBehaviour) {
    case 'keepInPlace':
      const keepInPlaceOldPredecessor = resolvePredecessorByIndex(loadedProcess, processItemIndex)
      const keepInPlaceOldSuccessor = resolveSuccessorByIndex(loadedProcess, processItemIndex)
      const keepInPlaceNewPredecessor = resolvePredecessorByTimestamp(loadedProcess, newScheduledAtUTC)
      const keepInPlaceNewSuccessor = keepInPlaceNewPredecessor
        ? resolveSuccessorByIndex(loadedProcess, keepInPlaceNewPredecessor.Index)
        : minItemBy(
            loadedProcess.ProcessItemAttachment.filter(({ Index }) => processItemIndex),
            (item) => item.Index,
          )
      // Part 1 - detach process item
      // 1. Point Old Successor to Old Predecessor
      // (Not implemented) IDEA - decretent every item since Old Successor till the end (including old successor) to maintain linear scale
      if (keepInPlaceOldSuccessor) {
        const keepInPlaceOldSuccessorEvent = getProcessItemAttachmentEvent(keepInPlaceOldSuccessor)
        const keepInPlaceOldSuccessorBaseline = keepInPlaceOldPredecessor
          ? getProcessItemAttachmentEvent(keepInPlaceOldPredecessor).EndsAtUTC
          : loadedProcess.ScheduleBaselineUTC
        processItemAttachmentIndexAndCalculatedOffsetUpdates =
          processItemAttachmentIndexAndCalculatedOffsetUpdates.concat({
            Id: keepInPlaceOldSuccessor.Id,
            Index: keepInPlaceOldSuccessor.Index,
            CalculatedItemOffsetInMinutes: duration.timeDiffInMinutes(
              keepInPlaceOldSuccessorEvent.ScheduledAtUTC,
              keepInPlaceOldSuccessorBaseline,
            ),
          })
      }
      // Part 2 - attach process item
      // 2a) Point changed item to New Predecessor
      const keepInPlaceNewPredecessorIndex = keepInPlaceNewPredecessor?.Index ?? -1
      // Note - if item is rescheduled to be first, then all other indexes should be updated, since they are expected to have non-negative value (0 indexing)
      const keepInPlaceNewProcessItemIndex = keepInPlaceNewPredecessorIndex + 1
      const keepInPlaceNewProcessItemBaseline = keepInPlaceNewPredecessor
        ? getProcessItemAttachmentEvent(keepInPlaceNewPredecessor).EndsAtUTC
        : loadedProcess.ScheduleBaselineUTC
      processItemAttachmentIndexAndCalculatedOffsetUpdates =
        processItemAttachmentIndexAndCalculatedOffsetUpdates.concat({
          Id: processItemAttachment.Id,
          Index: keepInPlaceNewProcessItemIndex,
          CalculatedItemOffsetInMinutes: duration.timeDiffInMinutes(
            newScheduledAtUTC,
            keepInPlaceNewProcessItemBaseline,
          ),
        })
      // 2b) Point New Successor to changed item
      const keepInPlaceNewProcessItemEndsAtUTC = duration.calculateEndsAtFromBeginAndDuration(
        newScheduledAtUTC,
        newDuration,
      )
      if (keepInPlaceNewSuccessor) {
        const keepInPlaceNewSuccessorEvent = getProcessItemAttachmentEvent(keepInPlaceNewSuccessor)
        // * if by any chance new successor is identical with old successor, override previous update with new one
        processItemAttachmentIndexAndCalculatedOffsetUpdates = processItemAttachmentIndexAndCalculatedOffsetUpdates
          .filter(({ Id }) => Id !== keepInPlaceNewSuccessor.Id)
          .concat({
            Id: keepInPlaceNewSuccessor.Id,
            Index: keepInPlaceNewProcessItemIndex + 1,
            CalculatedItemOffsetInMinutes: duration.timeDiffInMinutes(
              keepInPlaceNewSuccessorEvent.ScheduledAtUTC,
              keepInPlaceNewProcessItemEndsAtUTC,
            ),
          })
      }
      // REST OF THE UPDATES
      // * event update
      eventsToRescheduleUpdates = eventsToRescheduleUpdates.concat({
        Id: processItemAttachmentEvent.Id,
        Duration: newDuration,
        ScheduledAtUTC: newScheduledAtUTC,
      })
      const keepInPlaceIncrementIndexExclusions = processItemAttachmentIndexAndCalculatedOffsetUpdates.map(
        ({ Index }) => Index,
      )
      // * increment all indexes greater than index of new predecessor by 1 for prevention of violation of unique constraints
      // * exclude from those those indexes that are already updated
      processItemAttachmentIdsToIncrementIndex = resolveAllProcessItemsAfterByIndex(
        loadedProcess,
        keepInPlaceNewPredecessorIndex,
      )
        .filter(({ Index }) => !keepInPlaceIncrementIndexExclusions.includes(Index))
        .map(({ Index }) => Index)
      break
    case 'preserveCalculatedOffsets':
      const preserveCalculatedOffsetsReferencePoint = duration.calculateEndsAtFromBeginAndDuration(
        newScheduledAtUTC,
        newDuration,
      )
      eventsToRescheduleUpdates = createProcessItemScheduleFromResolvedOffsets(
        preserveCalculatedOffsetsReferencePoint,
        resolveActiveProcessItemsAfterByIndex(loadedProcess, processItemIndex),
        (processItem) => processItem.CalculatedItemOffsetInMinutes,
        (processItem) => processItem.EventSourceReference[0].Event!.Duration,
      ).map(({ processItem, scheduledAtUTC }) => {
        const event = getProcessItemAttachmentEvent(processItem)
        return {
          Id: event.Id,
          Duration: event.Duration,
          ScheduledAtUTC: scheduledAtUTC,
        }
      })
      break
    case 'reevaluateRelations':
      const reevaluateRelationssReferencePoint = duration.calculateEndsAtFromBeginAndDuration(
        newScheduledAtUTC,
        newDuration,
      )
      const processItemScheduleFromProcessItemOffsets = createProcessItemScheduleFromProcessItemOffsets(
        reevaluateRelationssReferencePoint,
        timezone,
        resolveActiveProcessItemsAfterByIndex(loadedProcess, processItemIndex),
        // ? zod validator
        (processItem) => processItem.ItemOffset as any,
        (processItem) => getProcessItemAttachmentEvent(processItem).Duration,
      )
      processItemAttachmentIndexAndCalculatedOffsetUpdates = processItemScheduleFromProcessItemOffsets.map(
        ({ processItem, calculatedOffsetInMinutes }) => ({
          Id: processItem.Id,
          Index: processItem.Index,
          CalculatedItemOffsetInMinutes: calculatedOffsetInMinutes,
        }),
      )
      eventsToRescheduleUpdates = processItemScheduleFromProcessItemOffsets.map(({ processItem, scheduledAtUTC }) => {
        const event = getProcessItemAttachmentEvent(processItem)
        return {
          Id: event.Id,
          Duration: event.Duration,
          ScheduledAtUTC: scheduledAtUTC,
        }
      })
      break
    default:
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid process item behaviour: ${subsequentProcessItemsBehaviour}`,
      })
  }
  if (!hasProcessStarted) {
    const updatedEventScheduleList = loadedProcess.ProcessItemAttachment.filter(
      (item) => item.Index !== processItemIndex,
    )
      .map((item) => getProcessItemAttachmentEvent(item).ScheduledAtUTC)
      .concat(newScheduledAtUTC)
    newProcessStartsAt = minItemBy(updatedEventScheduleList, (d) => d)
  }
  return {
    processId: loadedProcess.Id,
    processItemAttachmentIdsToDeactivate,
    processItemAttachmentIdsToIncrementIndex,
    processItemAttachmentIndexAndCalculatedOffsetUpdates,
    eventIdsToCancel,
    eventsToRescheduleUpdates,
    newProcessStartsAt,
    shouldCancelProcess,
    now,
  }
}

export const resolveCancelProcessUpdates = (loadedProcess: LoadedProcess): ProcessUpdates => {
  const now = new Date()
  const processItemAttachmentIdsToDeactivate = loadedProcess.ProcessItemAttachment.map(({ Id }) => Id)
  const eventIdsToCancel = loadedProcess.ProcessItemAttachment.map(
    (processItemAttachment) => getProcessItemAttachmentEvent(processItemAttachment).Id,
  )
  return {
    processId: loadedProcess.Id,
    processItemAttachmentIdsToDeactivate,
    processItemAttachmentIdsToIncrementIndex: [],
    processItemAttachmentIndexAndCalculatedOffsetUpdates: [],
    eventIdsToCancel,
    eventsToRescheduleUpdates: [],
    newProcessStartsAt: null,
    shouldCancelProcess: true,
    now,
  }
}

export const resolveRescheduleProcessUpdates = (
  loadedProcess: LoadedProcess,
  scheduleBaselineUTC: Date,
  timezone: string,
): ProcessUpdates => {
  const newProcessScheduleBaselineUTC = scheduleBaselineUTC
  const newProcessSchedule = createProcessItemScheduleFromProcessItemOffsets(
    newProcessScheduleBaselineUTC,
    timezone,
    loadedProcess.ProcessItemAttachment,
    // ? zod validator
    (processItem) => processItem.ItemOffset as any,
    (processItem) => getProcessItemAttachmentEvent(processItem).Duration,
  )
  // Array is validated to be non-empty
  // 1. process sources (templates) are validated to have at least single item
  // 2. Api validates that reschduling can happen only on processes that haven't started yet
  const newProcessStartsAt = newProcessSchedule[0].scheduledAtUTC
  const processItemAttachmentIndexAndCalculatedOffsetUpdates = newProcessSchedule.map(
    ({ processItem, calculatedOffsetInMinutes }) => ({
      Id: processItem.Id,
      Index: processItem.Index,
      CalculatedItemOffsetInMinutes: calculatedOffsetInMinutes,
    }),
  )
  const eventsToRescheduleUpdates = newProcessSchedule.map(({ processItem, scheduledAtUTC }) => {
    const event = getProcessItemAttachmentEvent(processItem)
    return {
      Id: event.Id,
      Duration: event.Duration,
      ScheduledAtUTC: scheduledAtUTC,
    }
  })
  const now = new Date()
  return {
    processId: loadedProcess.Id,
    processItemAttachmentIdsToDeactivate: [],
    processItemAttachmentIdsToIncrementIndex: [],
    processItemAttachmentIndexAndCalculatedOffsetUpdates,
    eventIdsToCancel: [],
    eventsToRescheduleUpdates,
    newProcessStartsAt,
    shouldCancelProcess: false,
    now,
  }
}

// Order of operations
// 1. update event schedule
// 2. update process item attachment offset and calculated updates
// 3. increment process item index
// 4. update event state
// 5. update process item attachment - is active
export const syncProcessUpdates = async ({
  processId,
  processItemAttachmentIdsToDeactivate,
  processItemAttachmentIndexAndCalculatedOffsetUpdates,
  processItemAttachmentIdsToIncrementIndex,
  eventsToRescheduleUpdates,
  eventIdsToCancel,
  newProcessStartsAt,
  shouldCancelProcess,
}: ProcessUpdates) => {
  const now = new Date()
  return prisma.$transaction(async (tx) => {
    await queries.transactional.bulkUpdateProcessEventSchedules(tx, eventsToRescheduleUpdates, now)
    await queries.transactional.bulkUpdateProcessItemAttachmentCalculatedOffsets(
      tx,
      processItemAttachmentIndexAndCalculatedOffsetUpdates,
      now,
    )
    // Note - if by any chance eventual enforcement of unique constraints doesn't work in transactions
    // consider refactoring by maintaining linear scale of process item indexes, incrementing 1st and updating index 2nd
    // Example (Changing from position 4 to 2)
    // Step 1
    // 1 -> 2 -> 3 -> 4 -> 5
    //      ▲         │
    //      └─────────┘
    // Step 2
    // 1 -> 3 -> 4 -> 5 -> 6
    //      ▲         │
    //      └─────────┘
    // Step 3 (swapping)
    // 1 -> 5 -> 3 -> 4 -> 6
    // Step 3 (align 5~>2)
    // 1 -> 2 -> 3 -> 4 -> 6
    await queries.transactional.bulkIncrementProcessItemAttachemntIndex(
      tx,
      processItemAttachmentIdsToIncrementIndex,
      now,
    )
    await queries.transactional.bulkCancelProcessEvents(tx, eventIdsToCancel, now)
    await queries.transactional.bulkDeactivateProcessItemAttachments(tx, processItemAttachmentIdsToDeactivate, now)
    if (newProcessStartsAt) {
      await queries.transactional.updateProcessStartByProcessId(tx, processId, newProcessStartsAt)
    }
    if (shouldCancelProcess) {
      await queries.transactional.cancelProcess(tx, processId)
    }
    return queries.transactional.findProcessById(tx, processId)
  })
}
