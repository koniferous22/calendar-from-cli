import {
  createZCreateTrustedViewerAccessInput,
  zRevokeTrustedViewerAccessInput,
  zAuthenticateTrustedViewerAccessInput,
  zRefreshTrustedViewerTokenInput,
  zValidateTrustedViewerAccessInput,
} from './universal/api-input/trustedViewer.js'
import { createZAccessTokenPayload } from './universal/api-auth/accessToken.js'
import { createZRefreshTokenPayload } from './universal/api-auth/refreshToken.js'
import {
  createZCalendarListEventsInDayInput,
  createZCalendarListEventsInWeekInput,
  createZCalendarListEventsInMonthInput,
  createZCalendarListEventsInYearInput,
} from './universal/api-input/calendar/calendarListEvents.js'
import {
  createZCalendarListFutureEventsInDayInput,
  createZCalendarListFutureEventsInWeekInput,
  createZCalendarListFutureEventsInMonthInput,
  createZCalendarListFutureEventsInYearInput,
} from './universal/api-input/calendar/calendarListFutureEvents.js'
import {
  createZCancelEventInput,
  createZRescheduleEventInput,
  createZScheduleAdHocEventInput,
} from './universal/api-input/event.js'
import { createZUpsertEventTagInput, createZRemoveEventTagInput } from './universal/api-input/eventTag.js'
import {
  createZUpsertEventTemplateInput,
  createZRemoveEventTemplateInput,
  createZScheduleEventFromEventTemplateInput,
  createZScheduleRecurringEventFromEventTemplateInput,
} from './universal/api-input/eventTemplate.js'
import {
  zCancelProcessInput,
  createZCancelProcessItemInput,
  createZRescheduleProcessInput,
  createZRescheduleProcessItemInput,
} from './universal/api-input/process.js'
import {
  createZUpsertProcessTemplateInput,
  createZRemoveProcessTemplateInput,
  createZScheduleProcessFromProcessTemplateInput,
} from './universal/api-input/processTemplate.js'
import {
  zCancelRecurringEventInput,
  zCancelRecurringEventInstanceInput,
  createZRescheduleRecurringEventInstanceInput,
  createZUpdateRecurringEventScheduleInput,
} from './universal/api-input/recurringEvent.js'
import { createZPasswordSetup } from './universal/user-input/password.js'
import { createZUrlCalendarRangeIdentifier } from './universal/url-input/calendarRangeIdentifier.js'

export const universalValidators = {
  authInput: {
    createZAccessTokenPayload,
    createZRefreshTokenPayload,
  },
  apiInput: {
    calendar: {
      createZCalendarListEventsInDayInput,
      createZCalendarListEventsInWeekInput,
      createZCalendarListEventsInMonthInput,
      createZCalendarListEventsInYearInput,
      createZCalendarListFutureEventsInDayInput,
      createZCalendarListFutureEventsInWeekInput,
      createZCalendarListFutureEventsInMonthInput,
      createZCalendarListFutureEventsInYearInput,
    },
    event: {
      createZCancelEventInput,
      createZRescheduleEventInput,
      createZScheduleAdHocEventInput,
    },
    eventTag: {
      createZUpsertEventTagInput,
      createZRemoveEventTagInput,
    },
    eventTemplate: {
      createZUpsertEventTemplateInput,
      createZRemoveEventTemplateInput,
      createZScheduleEventFromEventTemplateInput,
      createZScheduleRecurringEventFromEventTemplateInput,
    },
    process: {
      zCancelProcessInput,
      createZCancelProcessItemInput,
      createZRescheduleProcessInput,
      createZRescheduleProcessItemInput,
    },
    processTemplate: {
      createZUpsertProcessTemplateInput,
      createZRemoveProcessTemplateInput,
      createZScheduleProcessFromProcessTemplateInput,
    },
    recurringEvent: {
      zCancelRecurringEventInput,
      zCancelRecurringEventInstanceInput,
      createZRescheduleRecurringEventInstanceInput,
      createZUpdateRecurringEventScheduleInput,
    },
    trustedViewer: {
      createZCreateTrustedViewerAccessInput,
      zRevokeTrustedViewerAccessInput,
      zAuthenticateTrustedViewerAccessInput,
      zRefreshTrustedViewerTokenInput,
      zValidateTrustedViewerAccessInput,
    },
  },
  urlInput: {
    createZUrlCalendarRangeIdentifier,
  },
  userInput: {
    password: {
      createZPasswordSetup,
    },
  },
}
