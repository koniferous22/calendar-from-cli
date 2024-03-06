import { EventSourceType } from '@prisma/client'
import { config } from '@calendar-from-cli/validation-lib'
import { z } from 'zod'

type EventSourceTypeT = keyof typeof EventSourceType

type UniversalConfig = z.infer<typeof config.zUniversalConfig>

const configureRescheduleEventDisallowedTypes = (
  opts: UniversalConfig['inputValidation']['eventSourceTypes']['updatingFlags'],
): [EventSourceTypeT, ...EventSourceTypeT[]] => [
  'ProcessItemAttachment',
  ...(opts.shouldAllowChangingAppointmentEvents ? ['AppointmentBooking' as const] : []),
  ...(opts.shouldAllowChangingIntegrationEvents ? ['Integration' as const] : []),
]

const configureCancelEventDisallowedTypes = (
  opts: UniversalConfig['inputValidation']['eventSourceTypes']['updatingFlags'],
): [EventSourceTypeT, ...EventSourceTypeT[]] => [
  'ProcessItemAttachment',
  ...(opts.shouldAllowChangingAppointmentEvents ? ['AppointmentBooking' as const] : []),
  ...(opts.shouldAllowChangingIntegrationEvents ? ['Integration' as const] : []),
]

export const createConfigurableDenyLists = (commonConfig: UniversalConfig) => ({
  rescheduleEventDisallowedTypes: configureRescheduleEventDisallowedTypes(
    commonConfig.inputValidation.eventSourceTypes.updatingFlags,
  ),
  cancelEventDisallowedTypes: configureCancelEventDisallowedTypes(
    commonConfig.inputValidation.eventSourceTypes.updatingFlags,
  ),
})
