import { config, configurable } from '@calendar-from-cli/validation-lib'
import { z } from 'zod'

type UniversalConfig = z.infer<typeof config.zUniversalConfig>

export const createConfigurableApiInputValidators = (config: UniversalConfig) => ({
  event: {
    zCancelEvent: configurable.universalValidators.apiInput.event.createZCancelEventInput(config),
    zRescheduleEvent: configurable.universalValidators.apiInput.event.createZRescheduleEventInput(config),
    zScheduleAdHocEvent: configurable.universalValidators.apiInput.event.createZScheduleAdHocEventInput(config),
  },
  calendar: {
    zListEventsInDay: configurable.universalValidators.apiInput.calendar.createZCalendarListEventsInDayInput(
      config.inputValidation.api.calendarList.lowerLimit,
      config.inputValidation.api.calendarList.maxYearsAhead,
      config.timezone,
    ),
    zListEventsInWeek: configurable.universalValidators.apiInput.calendar.createZCalendarListEventsInWeekInput(
      config.inputValidation.api.calendarList.lowerLimit,
      config.inputValidation.api.calendarList.maxYearsAhead,
      config.timezone,
    ),
    zListEventsInMonth: configurable.universalValidators.apiInput.calendar.createZCalendarListEventsInMonthInput(
      config.inputValidation.api.calendarList.lowerLimit,
      config.inputValidation.api.calendarList.maxYearsAhead,
      config.timezone,
    ),
    zListEventsInYear: configurable.universalValidators.apiInput.calendar.createZCalendarListEventsInYearInput(
      config.inputValidation.api.calendarList.lowerLimit,
      config.inputValidation.api.calendarList.maxYearsAhead,
      config.timezone,
    ),
    zListFutureEventsInDay:
      configurable.universalValidators.apiInput.calendar.createZCalendarListFutureEventsInDayInput(
        config.inputValidation.api.calendarList.lowerLimit,
        config.inputValidation.api.calendarList.maxYearsAhead,
        config.timezone,
      ),
    zListFutureEventsInWeek:
      configurable.universalValidators.apiInput.calendar.createZCalendarListFutureEventsInWeekInput(
        config.inputValidation.api.calendarList.lowerLimit,
        config.inputValidation.api.calendarList.maxYearsAhead,
        config.timezone,
      ),
    zListFutureEventsInMonth:
      configurable.universalValidators.apiInput.calendar.createZCalendarListFutureEventsInMonthInput(
        config.inputValidation.api.calendarList.lowerLimit,
        config.inputValidation.api.calendarList.maxYearsAhead,
        config.timezone,
      ),
    zListFutureEventsInYear:
      configurable.universalValidators.apiInput.calendar.createZCalendarListFutureEventsInYearInput(
        config.inputValidation.api.calendarList.lowerLimit,
        config.inputValidation.api.calendarList.maxYearsAhead,
        config.timezone,
      ),
  },
  eventTemplate: {
    zUpsertEventTemplateInput:
      configurable.universalValidators.apiInput.eventTemplate.createZUpsertEventTemplateInput(config),
    zRemoveEventTemplateInput:
      configurable.universalValidators.apiInput.eventTemplate.createZRemoveEventTemplateInput(config),
    zScheduleEventInput:
      configurable.universalValidators.apiInput.eventTemplate.createZScheduleEventFromEventTemplateInput(config),
    zScheduleRecurringEventInput:
      configurable.universalValidators.apiInput.eventTemplate.createZScheduleRecurringEventFromEventTemplateInput(
        config,
      ),
  },
  eventTag: {
    zUpsertEventTagInput: configurable.universalValidators.apiInput.eventTag.createZUpsertEventTagInput(config),
    zRemoveEventTagInput: configurable.universalValidators.apiInput.eventTag.createZRemoveEventTagInput(config),
  },
  process: {
    zCancelProcessInput: configurable.universalValidators.apiInput.process.zCancelProcessInput,
    zRescheduleProcessInput: configurable.universalValidators.apiInput.process.createZRescheduleProcessInput(config),
    zCancelProcessItemInput: configurable.universalValidators.apiInput.process.createZCancelProcessItemInput(config),
    zRescheduleProcessItemInput:
      configurable.universalValidators.apiInput.process.createZRescheduleProcessItemInput(config),
  },
  processTemplate: {
    zUpsertProcessTemplateInput:
      configurable.universalValidators.apiInput.processTemplate.createZUpsertProcessTemplateInput(config),
    zRemoveProcessTemplateInput:
      configurable.universalValidators.apiInput.processTemplate.createZRemoveProcessTemplateInput(config),
    zScheduleProcessFromProcessTemplateInput:
      configurable.universalValidators.apiInput.processTemplate.createZScheduleProcessFromProcessTemplateInput(config),
  },
  recurringEvent: {
    zCancelRecurringEventInput: configurable.universalValidators.apiInput.recurringEvent.zCancelRecurringEventInput,
    zUpdateRecurringEventScheduleInput:
      configurable.universalValidators.apiInput.recurringEvent.createZUpdateRecurringEventScheduleInput(config),
    zCancelRecurringEventInstanceInput:
      configurable.universalValidators.apiInput.recurringEvent.zCancelRecurringEventInstanceInput,
    zRescheduleRecurringEventInstanceInput:
      configurable.universalValidators.apiInput.recurringEvent.createZRescheduleRecurringEventInstanceInput(config),
  },
  trustedViewer: {
    zCreateTrustedViewerAccessInput:
      configurable.universalValidators.apiInput.trustedViewer.createZCreateTrustedViewerAccessInput(config),
    zRevokeTrustedViewerAccessInput:
      configurable.universalValidators.apiInput.trustedViewer.zRevokeTrustedViewerAccessInput,
    zValidateTrustedViewerAccessInput:
      configurable.universalValidators.apiInput.trustedViewer.zValidateTrustedViewerAccessInput,
    zAuthenticateTrustedViewerAccessInput:
      configurable.universalValidators.apiInput.trustedViewer.zAuthenticateTrustedViewerAccessInput,
    zRefreshTrustedViewerTokenInput:
      configurable.universalValidators.apiInput.trustedViewer.zRefreshTrustedViewerTokenInput,
  },
})
