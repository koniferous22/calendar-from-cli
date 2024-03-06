import { types } from '@calendar-from-cli/validation-lib'
import { EventTag, TrustedViewer, TrustedViewerCalendarPermissions, TrustedViewerEventTagAccess } from '@prisma/client'

type CreateTrustedViewerAccessEventTagRelations = {
  defaultEventTagAccess: TrustedViewerEventTagAccess
  eventTagAccess: {
    eventTag: EventTag
    eventTagAccess: TrustedViewerEventTagAccess
  }[]
}

export type CreateTrustedViewerInput = {
  fields: Pick<TrustedViewer, 'Alias' | 'GrantExpiresAt'>
  eventTagRelations: CreateTrustedViewerAccessEventTagRelations
  passwordHash: string
  calendarPermissions: Omit<TrustedViewerCalendarPermissions, 'Id'>
  webAppSettings: types.WebAppSettings | null
}
