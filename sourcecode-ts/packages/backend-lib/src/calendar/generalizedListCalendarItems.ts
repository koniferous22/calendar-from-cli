import { queries } from '@calendar-from-cli/db-queries'
import { prisma, PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'
import { dst, getRecurringEventInstanceGenerator, duration } from '@calendar-from-cli/calendar-utils'
import { types } from '@calendar-from-cli/validation-lib'
import { CalendarItem, GeneralizedListingOptions, ListedRecurringEvents } from './types.js'
import {
  resolveSequencedProcessItemIndexing,
  resolveSequencedProcessSnapshotItemIndexing,
} from '../process/resolveSequenceItemIndexing.js'
import { resolveEventTagAccessFromPermissions } from '../trusted-viewer/eventTagPermissions.js'

const formatColor = (encodedColor: number) => `#${encodedColor.toString(16)}`

const listOngoingProcessesFromListedEvents = async (
  events: Awaited<ReturnType<(typeof queries)['listActiveEvents']>>,
) => {
  const eventSourceReferences = events.map(({ EventSourceReference }) => EventSourceReference)
  const processAttachmentIds = eventSourceReferences
    .filter(
      ({ EventSourceType, ProcessItemAttachmentId }) =>
        EventSourceType === 'ProcessItemAttachment' && ProcessItemAttachmentId !== null,
    )
    .map(({ ProcessItemAttachmentId }) => ProcessItemAttachmentId!)
  const ongoingProcesses = await queries.listProcessesByProcessAttachmentIds(processAttachmentIds)
  return ongoingProcesses.map(resolveSequencedProcessItemIndexing)
}

const listProcessSnapshotFromListedHistoricEvents = async (
  historicEvents: Awaited<ReturnType<(typeof queries)['listHistoricEvents']>>,
) => {
  const historicProcessSnapshotIds = historicEvents
    .filter(({ HistoricProcessSnapshot }) => HistoricProcessSnapshot !== null)
    .map(({ HistoricProcessSnapshot }) => HistoricProcessSnapshot!.Id)
  const historicProcessSnapshots = await queries.listHistoricProcessSnapshotsByIds(historicProcessSnapshotIds)
  return historicProcessSnapshots.map(resolveSequencedProcessSnapshotItemIndexing)
}

const generateRecurringEventInstanceSchedules = (
  utcFrom: Date,
  utcTo: Date,
  localeTimezone: string,
  recurrence: types.RecurringEventScheduleSpec,
) => {
  const generator = getRecurringEventInstanceGenerator(utcFrom, localeTimezone, recurrence)
  const result: Date[] = []
  let currentEvent = generator.next().value as Date
  while (currentEvent < utcTo) {
    result.push(currentEvent)
    currentEvent = generator.next().value as Date
  }
  return result
}

const generateExpectedRecurringInstances = (
  recurringEvents: ListedRecurringEvents,
  utcFrom: Date,
  utcTo: Date,
  timezone: string,
) => {
  return recurringEvents.flatMap((recurringEvent) => {
    const recurrence = recurringEvent.Recurrence as types.RecurringEventScheduleSpec
    const recurringEventTimes = generateRecurringEventInstanceSchedules(utcFrom, utcTo, timezone, recurrence)
    return recurringEventTimes.map((scheduledAtUTC) => {
      const { days: offsetFromBaselineDays, isExact } = dst.calculateDSTAdjustedTimeOffsetInDays(
        recurringEvent.BaselineUTCSchedule,
        scheduledAtUTC,
        timezone,
      )
      // NYI
      if (!isExact) {
      }
      const endsAtUTC = duration.calculateEndsAtFromBeginAndDuration(scheduledAtUTC, recurringEvent.Duration)
      return {
        recurringEvent,
        offsetFromBaselineDays,
        scheduledAtUTC,
        endsAtUTC,
      }
    })
  })
}

const attachRecurringEventInstancesToSet = async (
  pc: PrismaClientReusableInTransactions,
  recurringEventInstanceSetId: number,
  atomicCalendarViewVersionId: number,
  recurringEventInstances: ReturnType<typeof generateExpectedRecurringInstances>,
) => {
  const recurringEventInstancesResult = await Promise.all(
    recurringEventInstances.map(async (recurringEventInstanceInput) => {
      const recurringEventInstance = await pc.recurringEventInstance.findUnique({
        where: {
          RecurringEventId_AtomicCalendarViewVersionId_OffsetFromBaselineDays: {
            AtomicCalendarViewVersionId: atomicCalendarViewVersionId,
            RecurringEventId: recurringEventInstanceInput.recurringEvent.Id,
            OffsetFromBaselineDays: recurringEventInstanceInput.offsetFromBaselineDays,
          },
        },
      })
      if (!!recurringEventInstance) {
        return {
          ...recurringEventInstanceInput,
          shouldAttach: true as const,
          recurringEventInstance,
        }
      }
      return {
        ...recurringEventInstanceInput,
        shouldAttach: false as const,
      }
    }),
  )
  const instancesToAttach = recurringEventInstancesResult.filter(({ shouldAttach }) => shouldAttach) as Extract<
    (typeof recurringEventInstancesResult)[number],
    { shouldAttach: true }
  >[]
  const instancesToCreate = recurringEventInstancesResult.filter(({ shouldAttach }) => !shouldAttach) as Extract<
    (typeof recurringEventInstancesResult)[number],
    { shouldAttach: false }
  >[]
  await pc.recurringEventInstanceSetMembership.createMany({
    data: instancesToAttach.map(({ recurringEventInstance }) => ({
      RecurringEventInstanceId: recurringEventInstance.Id,
      RecurringEventInstanceSetId: recurringEventInstanceSetId,
    })),
  })
  return {
    instancesToAttach,
    instancesToCreate,
  }
}

// NOTE - this is just the 'merge' procedure from merge-sort algorithm
const mergeFutureCalendarEvents = <EventT, RecurringEventInstanceT>(
  events: Extract<CalendarItem, { type: 'event' }>[],
  recurringEvents: Extract<CalendarItem, { type: 'recurringEvent' }>[],
) => {
  const mergedArray: CalendarItem[] = []
  let i = 0
  let j = 0

  while (i < events.length && j < recurringEvents.length) {
    if (events[i].utcScheduledAt <= recurringEvents[j].utcScheduledAt) {
      mergedArray.push(events[i])
      i++
    } else {
      mergedArray.push(recurringEvents[j])
      j++
    }
  }
  while (i < events.length) {
    mergedArray.push(events[i])
    i++
  }
  while (j < recurringEvents.length) {
    mergedArray.push(recurringEvents[j])
    j++
  }
  return mergedArray
}

// Generalized version for all APIs relying on it
export const generalizedListCalendarItems = async (
  from: Date,
  to: Date,
  timezone: string,
  calendarViewVersion: number,
  { enableProcessAssociations, pastConcealment, restrictEventTagAccess }: GeneralizedListingOptions,
) => {
  const listedHistoricEvents = await queries.listHistoricEvents(from, to)
  const processSnapshotsWithSequencedItemIndexing =
    await listProcessSnapshotFromListedHistoricEvents(listedHistoricEvents)
  const historicEvents: ReturnType<typeof mergeFutureCalendarEvents> = listedHistoricEvents.map((historicEvent) => ({
    type: 'historicEvent' as const,
    utcScheduledAt: historicEvent.ScheduledAtUTC,
    utcEndsAt: historicEvent.EndedAtUTC,
    duration: historicEvent.Duration,
    tag:
      historicEvent.EventTagSnapshotAlias !== null && historicEvent.EventTagSnapshotColor !== null
        ? {
            alias: historicEvent.EventTagSnapshotAlias,
            color: formatColor(historicEvent.EventTagSnapshotColor),
          }
        : null,
    historicEvent,
  }))
  const listedEvents = await queries.listActiveEvents(from, to)
  const processesWithSequencedItemIndexing = await listOngoingProcessesFromListedEvents(listedEvents)
  const events = listedEvents.map((event) => ({
    type: 'event' as const,
    utcScheduledAt: event.ScheduledAtUTC,
    utcEndsAt: event.EndsAtUTC,
    duration: event.Duration,
    tag:
      event.EventTag !== null
        ? {
            alias: event.EventTag.Alias,
            color: formatColor(event.EventTag.Color),
          }
        : null,
    event,
  }))
  let recurringEventInstanceSet = await queries.findRecurringEventInstanceSet(calendarViewVersion, from, to)
  let mergingResult: ReturnType<typeof mergeFutureCalendarEvents> = events
  if (!recurringEventInstanceSet) {
    const allActiveRecurringEvents = await queries.listAllActiveRecurringEvents()
    const recurringEventInstances = generateExpectedRecurringInstances(allActiveRecurringEvents, from, to, timezone)
    // 1 create recurring event instance set
    // 2 attach existing recurring event instances to recurring event instance set
    // 3 insert rest
    await prisma.$transaction(async (tx) => {
      recurringEventInstanceSet = await queries.transactional.createRecurringEventInstanceSet(
        tx,
        calendarViewVersion,
        from,
        to,
      )
      const { instancesToCreate } = await attachRecurringEventInstancesToSet(
        tx,
        recurringEventInstanceSet.Id,
        calendarViewVersion,
        recurringEventInstances,
      )
      await queries.transactional.createRecurringEventInstances(
        tx,
        calendarViewVersion,
        instancesToCreate.map(({ recurringEvent, offsetFromBaselineDays, scheduledAtUTC, endsAtUTC }) => ({
          recurringEventId: recurringEvent.Id,
          offsetFromBaselineDays,
          scheduledAtUTC,
          endsAtUTC,
        })),
      )
    })
    const recurringEventInstanceSetMembers = await queries.listRecurringEventInstanceSetMembers(
      recurringEventInstanceSet!.Id,
      from,
      to,
    )
    mergingResult = mergeFutureCalendarEvents(
      events,
      recurringEventInstanceSetMembers.map(({ RecurringEventInstance }) => ({
        type: 'recurringEvent' as const,
        utcScheduledAt: RecurringEventInstance.ScheduledAtUTC,
        utcEndsAt: RecurringEventInstance.EndsAtUTC,
        duration: RecurringEventInstance.RecurringEvent.Duration,
        tag:
          RecurringEventInstance.RecurringEvent.EventTag !== null
            ? {
                alias: RecurringEventInstance.RecurringEvent.EventTag.Alias,
                color: formatColor(RecurringEventInstance.RecurringEvent.EventTag.Color),
              }
            : null,
        recurringEvent: RecurringEventInstance,
      })),
    )
  }
  let calendarItems = historicEvents.concat(mergingResult)
  // Final formatting
  // * transform `event` object to `processEvent` object
  if (enableProcessAssociations) {
    calendarItems = calendarItems.map((calendarItem) => {
      switch (calendarItem.type) {
        case 'historicEvent': {
          const historicProcessSnapshot = calendarItem.historicEvent.HistoricProcessSnapshot
          if (historicProcessSnapshot) {
            const processSnapshotInfo = processSnapshotsWithSequencedItemIndexing
              .map(({ indexedHistoricProcessEvents, processSnapshot }) => ({
                processSnapshot,
                processItemsCompleted: processSnapshot.HistoricEvent.length,
                canonicalEventOrderInProcessSnapshot: indexedHistoricProcessEvents.find(
                  ({ historicEventId }) => historicEventId === calendarItem.historicEvent.Id,
                )?.sequencedIndex,
              }))
              .find((value) => !!value.canonicalEventOrderInProcessSnapshot)
            if (processSnapshotInfo) {
              return {
                ...calendarItem,
                type: 'historicProcessEvent',
                processSnapshotInfo: {
                  ...processSnapshotInfo,
                  canonicalEventOrderInProcessSnapshot: processSnapshotInfo?.canonicalEventOrderInProcessSnapshot!,
                },
              }
              // If data is incorrect for some reason, event associated without process is returned
            }
          }
          // Return 'historicEvent' unmodified
          return calendarItem
        }
        case 'event': {
          const calendarEventSourceReference = calendarItem.event.EventSourceReference
          if (calendarEventSourceReference.EventSourceType === 'ProcessItemAttachment') {
            const processInfo = processesWithSequencedItemIndexing
              .map(({ indexedProcessEvents, process }) => ({
                process,
                processItemCount:
                  (process.HistoricProcessSnapshot?.HistoricEvent?.length ?? 0) + process.ProcessItemAttachment.length,
                canonicalEventOrderInProcess: indexedProcessEvents.find(
                  ({ processItemAttachmentId }) =>
                    processItemAttachmentId === calendarEventSourceReference.ProcessItemAttachmentId,
                )?.sequencedIndex,
              }))
              .find((value) => !!value.canonicalEventOrderInProcess)
            if (processInfo) {
              return {
                ...calendarItem,
                type: 'processEvent',
                processInfo: {
                  ...processInfo,
                  canonicalEventOrderInProcess: processInfo.canonicalEventOrderInProcess!,
                },
              }
            }
            // If data is incorrect for some reason, event associated without process is returned
          }
          // Return 'event' unmodified
          return calendarItem
        }
        default:
          return calendarItem
      }
    })
  }
  if (pastConcealment.enabled) {
    calendarItems = calendarItems.map((calendarItem) => {
      switch (calendarItem.type) {
        case 'historicEvent':
        case 'historicProcessEvent':
          return {
            ...calendarItem,
            type: 'concealedItem',
            placeholder: pastConcealment.resolvePlaceholder(calendarItem.historicEvent),
          }
        default:
          return calendarItem
      }
    })
  }
  if (restrictEventTagAccess.enabled) {
    const { permissions } = restrictEventTagAccess
    // Note - there are missing objects from which the tag should be removed as well
    // * processes for instance (double-check schema.prisma)
    calendarItems = calendarItems.map((calendarItem) => {
      if (calendarItem.tag && resolveEventTagAccessFromPermissions(permissions, calendarItem.tag.alias)) {
        return calendarItem
      }
      return {
        ...calendarItem,
        tag: null,
      }
    })
  }
  return calendarItems
}
