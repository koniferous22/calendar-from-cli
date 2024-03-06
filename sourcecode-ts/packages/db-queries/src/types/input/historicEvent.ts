import { HistoricEvent } from '@prisma/client'
import {
  listEventsFromProcessItemAttachmentEndingEarlierThan,
  listEventsWithEventSourceTypeEndingEarlierThan,
} from '../../queries/transactional/event.js'
import { listRecurringEventInstancesEndingEarlierThan } from '../../queries/transactional/recurringEventInstance.js'

export type EventList = Awaited<ReturnType<typeof listEventsWithEventSourceTypeEndingEarlierThan>>
type EventFromProcessItemAttachmentList = Awaited<
  ReturnType<typeof listEventsFromProcessItemAttachmentEndingEarlierThan>
>

export type RecurringEventInstanceList = Awaited<ReturnType<typeof listRecurringEventInstancesEndingEarlierThan>>

export type CreateHistoricEventInput = Omit<HistoricEvent, 'Id' | 'HistoricProcessSnapshotId'>

export type CreateHistoricEventFromProcessInput = {
  historicEventInput: EventFromProcessItemAttachmentList[number]
  historicProcessSnapshotId: number
}
