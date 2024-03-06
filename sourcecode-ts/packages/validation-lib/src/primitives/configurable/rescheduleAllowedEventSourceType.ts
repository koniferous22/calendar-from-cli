import { z } from 'zod'
import { EventSourceType } from '@prisma/client'
// Note - I needed a workaround export lack of time to fix it, getting a strange errors

type Opts = {
  shouldAllowChangingAppointmentEvents: boolean
  shouldAllowChangingIntegrationEvents: boolean
}

export const createZEventRescheduleAllowedSourceType = ({
  shouldAllowChangingAppointmentEvents,
  shouldAllowChangingIntegrationEvents,
}: Opts) => {
  return z.nativeEnum(EventSourceType).superRefine((value, ctx) => {
    if (!shouldAllowChangingAppointmentEvents && value === 'AppointmentBooking') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cannot update events from appointment booking',
        fatal: true,
      })
    }
    if (!shouldAllowChangingIntegrationEvents && value === 'AppointmentBooking') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Integration appointments NYI',
        fatal: true,
      })
    }
  })
}
