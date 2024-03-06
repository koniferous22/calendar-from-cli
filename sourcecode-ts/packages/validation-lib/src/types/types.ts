import { z } from 'zod'
import { createZRecurringEventSchedule } from '../primitives/configurable/recurringEventSchedule.js'
import { createZProcessItemOffset } from '../primitives/configurable/processItemOffset.js'
import { createZScheduleAdHocEventInput } from '../configurable/universal/api-input/event.js'
import {
  zCancelProcessItemSubsequentProcessItemsBehaviour,
  zRescheduleProcessItemSubsequentProcessItemsBehaviour,
} from '../configurable/universal/api-input/process.js'
import { createZAccessTokenPayload } from '../configurable/universal/api-auth/accessToken.js'
import { zDescriptionFormat } from '../primitives/descriptionFormat.js'
import { zWebAppSettings } from '../primitives/webAppSettings.js'
import { createZUrlCalendarRangeIdentifier } from '../configurable/universal/url-input/calendarRangeIdentifier.js'
import { zEventUiSizeResolution } from '../primitives/eventUiSizeResolution.js'
import { zAuthResponseOptions } from '../primitives/authResponseOptions.js'
import { zCalendarPageError } from '../errors/calendarPageError.js'

export type AccessTokenPayload = z.infer<ReturnType<typeof createZAccessTokenPayload>>['data']

export type AdHocEventInput = z.infer<ReturnType<typeof createZScheduleAdHocEventInput>>

export type AuthResponseOptions = z.infer<typeof zAuthResponseOptions>

export type CalendarPageError = z.infer<typeof zCalendarPageError>

export type CalendarRangeIdentifier = z.infer<ReturnType<typeof createZUrlCalendarRangeIdentifier>>

export type CancelProcessItemSubsequentProcessItemsBehaviour = z.infer<
  typeof zCancelProcessItemSubsequentProcessItemsBehaviour
>

export type DescriptionFormat = z.infer<typeof zDescriptionFormat>

export type EventUiSizeResolution = z.infer<typeof zEventUiSizeResolution>

export type ProcessItemOffsetSpec = z.infer<ReturnType<typeof createZProcessItemOffset>>

export type RecurringEventScheduleSpec = z.infer<ReturnType<typeof createZRecurringEventSchedule>>

export type RescheduleProcessItemSubsequentProcessItemsBehaviour = z.infer<
  typeof zRescheduleProcessItemSubsequentProcessItemsBehaviour
>

export type WebAppSettings = z.infer<typeof zWebAppSettings>
