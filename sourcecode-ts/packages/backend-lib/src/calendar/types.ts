import { queries } from '@calendar-from-cli/db-queries'
import { types } from '@calendar-from-cli/validation-lib'
import { LoadedProcess } from '../process/types.js'
import { EventTagPermissions } from '../trusted-viewer/types.js'

export type ListedHistoricEvents = Awaited<ReturnType<(typeof queries)['listHistoricEvents']>>
export type ListedEvents = Awaited<ReturnType<(typeof queries)['listActiveEvents']>>
export type ListedRecurringEvents = Awaited<ReturnType<(typeof queries)['listAllActiveRecurringEvents']>>
export type ListedRecurringEventInstanceSetMembers = Awaited<
  ReturnType<(typeof queries)['listRecurringEventInstanceSetMembers']>
>

export type ListedHistoricEvent = ListedHistoricEvents[number]
export type ListedEvent = ListedEvents[number]
export type ListedRecurringEvent = ListedRecurringEvents[number]
export type ListedRecurringEventInstanceSetMember = ListedRecurringEventInstanceSetMembers[number]

export type ListedRecurringEventInstance = ListedRecurringEventInstanceSetMember['RecurringEventInstance']

type CalendarItemBase = {
  utcScheduledAt: Date
  utcEndsAt: Date
  duration: number
  tag: {
    alias: string
    color: string
  } | null
}

export type CalendarItem = CalendarItemBase &
  (
    | {
        type: 'historicEvent'
        historicEvent: ListedHistoricEvent
      }
    | {
        type: 'historicProcessEvent'
        historicEvent: ListedHistoricEvent
        processSnapshotInfo: {
          processSnapshot: NonNullable<LoadedProcess['HistoricProcessSnapshot']>
          processItemsCompleted: number
          canonicalEventOrderInProcessSnapshot: number
        }
      }
    | {
        type: 'concealedItem'
        placeholder: string
      }
    | {
        type: 'event'
        event: ListedEvent
      }
    | {
        type: 'processEvent'
        event: ListedEvent
        processInfo: {
          process: LoadedProcess
          processItemCount: number
          canonicalEventOrderInProcess: number
        }
      }
    | {
        type: 'recurringEvent'
        recurringEvent: ListedRecurringEventInstance
      }
  )

export type CalendarViewItem = CalendarItemBase &
  (
    | {
        type: 'historicEvent'
        title: string
        description: string
        descriptionFormat: ListedHistoricEvent['DescriptionFormat']
      }
    | {
        type: 'historicProcessEvent'
        title: string
        description: string
        descriptionFormat: ListedHistoricEvent['DescriptionFormat']
        processStatus: {
          processTitle: string
          processStartedAtUTC: Date
          processItemsCompleted: number
          canonicalItemIndexInProcessSnapshot: number
        }
      }
    | {
        type: 'concealedItem'
        placeholder: string
      }
    | {
        type: 'event'
        title: string
        description: string
        descriptionFormat: ListedEvent['DescriptionFormat']
      }
    | {
        type: 'processEvent'
        title: string
        description: string
        descriptionFormat: ListedEvent['DescriptionFormat']
        processStatus: {
          processTitle: string
          processStartsAtUTC: Date
          processItemsCompleted: number
          processItemCount: number
          canonicalItemIndexInProcess: number
        }
      }
    | {
        type: 'recurringEvent'
        title: string
        description: string
        descriptionFormat: ListedRecurringEvent['DescriptionFormat']
        recurringSchedule: types.RecurringEventScheduleSpec
      }
  )

export type GeneralizedListingOptions = {
  enableProcessAssociations: boolean
  pastConcealment:
    | {
        enabled: true
        resolvePlaceholder: (_: ListedHistoricEvent) => string
      }
    | {
        enabled: false
      }
  restrictEventTagAccess:
    | {
        enabled: false
      }
    | {
        enabled: true
        permissions: EventTagPermissions
      }
}
