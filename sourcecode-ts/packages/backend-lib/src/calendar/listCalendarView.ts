import { TransparencyScope } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { zonedRangeInterval, calendarRangeInterval } from '@calendar-from-cli/calendar-utils'
import {
  CalendarItem,
  CalendarViewItem,
  GeneralizedListingOptions,
  ListedEvent,
  ListedHistoricEvent,
  ListedRecurringEventInstance,
} from './types.js'
import { generalizedListCalendarItems } from './generalizedListCalendarItems.js'
import { AccessTokenPayload } from '@calendar-from-cli/validation-lib/build/types/types.js'

const getHistoricEventContentByRequestedScope = (
  requestedScope: TransparencyScope,
  historicEvent: ListedHistoricEvent,
) => {
  switch (requestedScope) {
    case 'Private':
      return {
        title: historicEvent.Title,
        description: historicEvent.Description,
        descriptionFormat: historicEvent.DescriptionFormat,
      }
    case 'Protected':
      return {
        title: historicEvent.ProtectedTitle,
        description: historicEvent.ProtectedDescription,
        descriptionFormat: historicEvent.ProtectedDescriptionFormat,
      }
    case 'Public':
      return {
        title: historicEvent.PublicTitle,
        description: historicEvent.PublicDescription,
        descriptionFormat: historicEvent.PublicDescriptionFormat,
      }
  }
}

const getEventContentByRequestedScope = (requestedScope: TransparencyScope, event: ListedEvent) => {
  switch (requestedScope) {
    case 'Private':
      return {
        title: event.Title,
        description: event.Description,
        descriptionFormat: event.DescriptionFormat,
      }
    case 'Protected':
      return {
        title: event.ProtectedTitle,
        description: event.ProtectedDescription,
        descriptionFormat: event.ProtectedDescriptionFormat,
      }
    case 'Public':
      return {
        title: event.PublicTitle,
        description: event.PublicDescription,
        descriptionFormat: event.PublicDescriptionFormat,
      }
  }
}

const getRecurringEventInstanceContentByRequestedScope = (
  requestedScope: TransparencyScope,
  recurringEventInstance: ListedRecurringEventInstance,
) => {
  switch (requestedScope) {
    case 'Private':
      return {
        title: recurringEventInstance.RecurringEvent.Title,
        description: recurringEventInstance.RecurringEvent.Description,
        descriptionFormat: recurringEventInstance.RecurringEvent.DescriptionFormat,
      }
    case 'Protected':
      return {
        title: recurringEventInstance.RecurringEvent.ProtectedTitle,
        description: recurringEventInstance.RecurringEvent.ProtectedDescription,
        descriptionFormat: recurringEventInstance.RecurringEvent.ProtectedDescriptionFormat,
      }
    case 'Public':
      return {
        title: recurringEventInstance.RecurringEvent.PublicTitle,
        description: recurringEventInstance.RecurringEvent.PublicDescription,
        descriptionFormat: recurringEventInstance.RecurringEvent.PublicDescriptionFormat,
      }
  }
}

const mapCalendarItemToCalendarViewItem = (
  calendarItem: CalendarItem,
  requestedScope: TransparencyScope,
): CalendarViewItem => {
  const calendarItemBase = {
    utcScheduledAt: calendarItem.utcScheduledAt,
    utcEndsAt: calendarItem.utcEndsAt,
    duration: calendarItem.duration,
    tag: calendarItem.tag,
  }
  switch (calendarItem.type) {
    case 'concealedItem':
      return {
        ...calendarItemBase,
        type: 'concealedItem',
        placeholder: calendarItem.placeholder,
      }
    case 'historicEvent':
      return {
        ...calendarItemBase,
        ...getHistoricEventContentByRequestedScope(requestedScope, calendarItem.historicEvent),
        type: 'historicEvent',
      }
    case 'historicProcessEvent':
      return {
        ...calendarItemBase,
        ...getHistoricEventContentByRequestedScope(requestedScope, calendarItem.historicEvent),
        type: 'historicProcessEvent',
        processStatus: {
          processTitle: calendarItem.processSnapshotInfo.processSnapshot.Title,
          processStartedAtUTC: calendarItem.processSnapshotInfo.processSnapshot.OriginalStartsAtUTC,
          processItemsCompleted: calendarItem.processSnapshotInfo.processItemsCompleted,
          canonicalItemIndexInProcessSnapshot: calendarItem.processSnapshotInfo.canonicalEventOrderInProcessSnapshot,
        },
      }
    case 'event':
      return {
        ...calendarItemBase,
        ...getEventContentByRequestedScope(requestedScope, calendarItem.event),
        type: 'event',
      }
    case 'processEvent':
      return {
        ...calendarItemBase,
        ...getEventContentByRequestedScope(requestedScope, calendarItem.event),
        type: 'processEvent',
        processStatus: {
          processTitle: calendarItem.processInfo.process.Title,
          processStartsAtUTC: calendarItem.processInfo.process.StartsAtUTC,
          processItemCount: calendarItem.processInfo.processItemCount,
          processItemsCompleted: calendarItem.processInfo.process.HistoricProcessSnapshot?.HistoricEvent?.length ?? 0,
          canonicalItemIndexInProcess: calendarItem.processInfo.canonicalEventOrderInProcess,
        },
      }
    case 'recurringEvent':
      return {
        ...calendarItemBase,
        ...getRecurringEventInstanceContentByRequestedScope(requestedScope, calendarItem.recurringEvent),
        type: 'recurringEvent',
        recurringSchedule: calendarItem.recurringEvent.RecurringEvent.Recurrence as any,
      }
  }
}

const wrapValidatePastListedInterval = (interval: readonly [Date, Date]) => {
  const now = new Date()
  if (interval[1] < now) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Past access not allowed',
    })
  }
  return interval
}

const resolveListingOptionsFromPermissions = (accessTokenPayload: AccessTokenPayload): GeneralizedListingOptions => ({
  enableProcessAssociations: accessTokenPayload.calendarPermissions.canSeeProcessAssociations,
  pastConcealment: accessTokenPayload.calendarPermissions.canViewPast
    ? {
        enabled: false,
      }
    : {
        enabled: true,
        resolvePlaceholder: (historicEvent) => historicEvent.Title,
      },
  restrictEventTagAccess: {
    enabled: true,
    permissions: {
      eventTagPermissionsType: accessTokenPayload.eventTagPermissionsType,
      eventTagPermissions: accessTokenPayload.eventTagPermissions,
    },
  },
})

const defaultPublicListingOptions: GeneralizedListingOptions = {
  enableProcessAssociations: false,
  pastConcealment: {
    enabled: true,
    resolvePlaceholder: (historicEvent) => historicEvent.Title,
  },
  restrictEventTagAccess: {
    enabled: true,
    permissions: {
      eventTagPermissionsType: 'allowList',
      eventTagPermissions: [],
    },
  },
}

const resolveAccessScopeFromPermissions = (accessTokenPayload: AccessTokenPayload | null): TransparencyScope =>
  accessTokenPayload !== null ? 'Protected' : 'Public'

export const listCalendarDayView = async (
  year: number,
  month: number,
  dayOfMonth: number,
  tz: string,
  calendarViewVersion: number,
  accessTokenPayload: AccessTokenPayload | null,
) => {
  const accessScope = resolveAccessScopeFromPermissions(accessTokenPayload)
  let interval = zonedRangeInterval.createZonedDayInterval(year, month, dayOfMonth, tz)
  if (accessTokenPayload?.calendarPermissions?.canViewPast !== true) {
    interval = wrapValidatePastListedInterval(interval)
  }
  const [zonedDayBegin, zonedDayEnd] = interval
  const listingOptions = accessTokenPayload
    ? resolveListingOptionsFromPermissions(accessTokenPayload)
    : defaultPublicListingOptions
  const calendarItems = await generalizedListCalendarItems(
    zonedDayBegin,
    zonedDayEnd,
    tz,
    calendarViewVersion,
    listingOptions,
  )
  return calendarItems.map((item) => mapCalendarItemToCalendarViewItem(item, accessScope))
}

export const listCalendarWeekView = async (
  year: number,
  month: number,
  dayOfMonth: number,
  tz: string,
  calendarViewVersion: number,
  accessTokenPayload: AccessTokenPayload | null,
) => {
  const accessScope = resolveAccessScopeFromPermissions(accessTokenPayload)
  let interval = zonedRangeInterval.createZonedWeekInterval(year, month, dayOfMonth, tz)
  if (accessTokenPayload?.calendarPermissions?.canViewPast !== true) {
    interval = wrapValidatePastListedInterval(interval)
  }
  const [zonedWeekBegin, zonedWeekEnd] = interval
  const listingOptions = accessTokenPayload
    ? resolveListingOptionsFromPermissions(accessTokenPayload)
    : defaultPublicListingOptions
  const calendarItems = await generalizedListCalendarItems(
    zonedWeekBegin,
    zonedWeekEnd,
    tz,
    calendarViewVersion,
    listingOptions,
  )
  return calendarItems.map((item) => mapCalendarItemToCalendarViewItem(item, accessScope))
}

export const listCalendarMonthView = async (
  year: number,
  month: number,
  tz: string,
  calendarViewVersion: number,
  accessTokenPayload: AccessTokenPayload | null,
) => {
  const accessScope = resolveAccessScopeFromPermissions(accessTokenPayload)
  let interval = calendarRangeInterval.createMonthCalendarRangeInterval(year, month, tz)
  if (accessTokenPayload?.calendarPermissions?.canViewPast !== true) {
    interval = wrapValidatePastListedInterval(interval)
  }
  const [calendarViewMonthBegin, calendarViewMonthEnd] = interval
  const listingOptions = accessTokenPayload
    ? resolveListingOptionsFromPermissions(accessTokenPayload)
    : defaultPublicListingOptions
  const calendarItems = await generalizedListCalendarItems(
    calendarViewMonthBegin,
    calendarViewMonthEnd,
    tz,
    calendarViewVersion,
    listingOptions,
  )
  return calendarItems.map((item) => mapCalendarItemToCalendarViewItem(item, accessScope))
}
