import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'
import {
  CreateHistoricEventFromProcessInput,
  CreateHistoricEventInput,
  EventList,
  RecurringEventInstanceList,
} from '../../types/input/historicEvent.js'

const generalizedCreateHistoricEvent = (
  pc: PrismaClientReusableInTransactions,
  historicEventInputs: CreateHistoricEventInput[],
) => {
  return pc.historicEvent.createMany({
    data: historicEventInputs,
  })
}

export const createHistoricEventsFromEvents = async (
  pc: PrismaClientReusableInTransactions,
  events: EventList,
  now: Date,
) => {
  return generalizedCreateHistoricEvent(
    pc,
    events
      .filter(({ EventState }) => EventState !== 'Cancelled')
      .map(
        ({
          Title,
          Description,
          DescriptionFormat,
          ProtectedTitle,
          ProtectedDescription,
          ProtectedDescriptionFormat,
          PublicTitle,
          PublicDescription,
          PublicDescriptionFormat,
          Duration,
          ScheduledAtUTC,
          EndsAtUTC,
          EventTag,
        }) => ({
          MigratedAt: now,
          Title,
          Description,
          DescriptionFormat,
          ProtectedTitle,
          ProtectedDescription,
          ProtectedDescriptionFormat,
          PublicTitle,
          PublicDescription,
          PublicDescriptionFormat,
          ScheduledAtUTC,
          EndedAtUTC: EndsAtUTC,
          Duration,
          EventTagSnapshotAlias: EventTag?.Alias ?? null,
          EventTagSnapshotColor: EventTag?.Color ?? null,
          HistoricProcessSnapshotId: null,
        }),
      ),
  )
}

export const createHistoricEventsFromRecurringEventInstances = async (
  pc: PrismaClientReusableInTransactions,
  recurringEventInstances: RecurringEventInstanceList,
  now: Date,
) => {
  return generalizedCreateHistoricEvent(
    pc,
    recurringEventInstances
      .filter(({ RecurringEventInstanceConversionId }) => RecurringEventInstanceConversionId === null)
      .map(({ RecurringEvent, ScheduledAtUTC, EndsAtUTC }) => {
        const {
          Title,
          Description,
          DescriptionFormat,
          ProtectedTitle,
          ProtectedDescription,
          ProtectedDescriptionFormat,
          PublicTitle,
          PublicDescription,
          PublicDescriptionFormat,
          EventTag,
          Duration,
        } = RecurringEvent
        return {
          MigratedAt: now,
          Title,
          Description,
          DescriptionFormat,
          ProtectedTitle,
          ProtectedDescription,
          ProtectedDescriptionFormat,
          PublicTitle,
          PublicDescription,
          PublicDescriptionFormat,
          ScheduledAtUTC,
          EndedAtUTC: EndsAtUTC,
          Duration,
          EventTagSnapshotAlias: EventTag?.Alias ?? null,
          EventTagSnapshotColor: EventTag?.Color ?? null,
        }
      }),
  )
}

export const createHistoricEventsFromProcessItemAttachmentEvents = async (
  pc: PrismaClientReusableInTransactions,
  events: CreateHistoricEventFromProcessInput[],
  now: Date,
) => {
  return generalizedCreateHistoricEvent(
    pc,
    events.map(({ historicEventInput, historicProcessSnapshotId }) => {
      const {
        Title,
        Description,
        DescriptionFormat,
        ProtectedTitle,
        ProtectedDescription,
        ProtectedDescriptionFormat,
        PublicTitle,
        PublicDescription,
        PublicDescriptionFormat,
        ScheduledAtUTC,
        EndsAtUTC,
        Duration,
        EventTag,
      } = historicEventInput
      return {
        MigratedAt: now,
        Title,
        Description,
        DescriptionFormat,
        ProtectedTitle,
        ProtectedDescription,
        ProtectedDescriptionFormat,
        PublicTitle,
        PublicDescription,
        PublicDescriptionFormat,
        ScheduledAtUTC,
        EndedAtUTC: EndsAtUTC,
        Duration,
        EventTagSnapshotAlias: EventTag?.Alias ?? null,
        EventTagSnapshotColor: EventTag?.Color ?? null,
        HistoricProcessSnapshotId: historicProcessSnapshotId,
      }
    }),
  )
}
