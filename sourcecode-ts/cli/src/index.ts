import inquirer from 'inquirer'
import DatePrompt from 'inquirer-date-prompt'
import AutocompletePrompt from 'inquirer-autocomplete-prompt'
import CheckboxPlusPrompt from 'inquirer-ts-checkbox-plus-prompt'
import { scheduleEventFromEventTemplate } from './operations/scheduleEventFromEventTemplate'
import { cancelEvent } from './operations/cancelEvent'
import { rescheduleEvent } from './operations/rescheduleEvent'
import { scheduleRecurringEventFromTemplate } from './operations/scheduleRecurringEventFromEventTemplate'
import { createAdHocEvent } from './operations/createAdHocEvent'
import { cancelRecurringEventInstance } from './operations/cancelRecurringEventInstance'
import { rescheduleRecurringEventInstance } from './operations/rescheduleRecurringEventInstance'
import { updateRecurringEventSchedule } from './operations/updateRecurringEventSchedule'
import { cancelRecurringEvent } from './operations/cancelRecurringEvent'
import { scheduleProcessFromProcessTemplate } from './operations/scheduleProcessFromProcessTemplate'
import { rescheduleUpcomingProcess } from './operations/rescheduleUpcomingProcess'
import { cancelUpcomingProcess } from './operations/cancelUpcomingProcess'
import { revokeTrustedViewerAccess } from './operations/revokeTrustedViewerAccess'
import { createTrustedViewerAccess } from './operations/createTrustedViewerAccess'
import { fuzzySelect } from './prompts/generic/fuzzySelect'
import { cancelProcessEvent } from './operations/cancelProcessEvent'
import { rescheduleProcessEvent } from './operations/rescheduleProcessEvent'
import { retrieveTrustedViewerUrl } from './operations/retrieveTrustedViewerUrl'

// @ts-expect-error type 'DatePrompt' is not assignable to inquirer.Prompt
inquirer.registerPrompt('date', DatePrompt)
inquirer.registerPrompt('autocomplete', AutocompletePrompt)
inquirer.registerPrompt('checkbox-plus', CheckboxPlusPrompt.CheckboxPlusPrompt)

const operations = [
  { name: 'Create an Event', value: 'createAdHocEvent' as const },
  { name: 'Schedule Event from a template', value: 'scheduleEventFromTemplate' as const },
  { name: 'Cancel Event', value: 'cancelEvent' as const },
  { name: 'Reschedule Event', value: 'rescheduleEvent' as const },
  { name: 'Cancel Process Event', value: 'cancelProcessEvent' as const },
  { name: 'Reschedule Process Event', value: 'rescheduleProcessEvent' as const },
  { name: 'Schedule Recurring Event from a template', value: 'scheduleRecurringEventFromTemplate' as const },
  { name: 'Cancel Recurring Event (single instance)', value: 'cancelRecurringEventInstance' as const },
  { name: 'Reschedule Recurring Event (single instance)', value: 'rescheduleRecurringEventInstance' as const },
  { name: 'Update Recurring Event Schedule', value: 'updateRecurringEventSchedule' as const },
  { name: 'Cancel Recurring Event (all future occurrences)', value: 'cancelRecurringEvent' as const },
  { name: 'Schedule Process from a template', value: 'scheduleProcessFromTemplate' as const },
  { name: 'Reschedule Upcoming Process', value: 'rescheduleUpcomingProcess' as const },
  { name: 'Cancel Upcoming Process', value: 'cancelUpcomingProcess' as const },
  { name: 'Create Trusted Viewer Access', value: 'createTrustedViewerAccess' as const },
  { name: 'Retrieve Trusted Viewer Url', value: 'retrieveTrustedViewerUrl' as const },
  { name: 'Revoke Trusted Viewer Access', value: 'revokeTrustedViewerAccess' as const },
]

const run = async () => {
  const answers = await fuzzySelect(operations, {
    getValue: (operation) => operation,
    getDescription: (operation) => operation.name,
    getFuzzyIndex: (operation) => operation.name,
    defaultDescription: 'No operation selected',
    messages: {
      fuzzySelectMessage: 'Choose operation',
    },
  })
  switch (answers.choice.value) {
    case 'createAdHocEvent':
      createAdHocEvent()
      break
    case 'scheduleEventFromTemplate':
      scheduleEventFromEventTemplate()
      break
    case 'cancelEvent':
      cancelEvent()
      break
    case 'rescheduleEvent':
      rescheduleEvent()
      break
    case 'cancelProcessEvent':
      cancelProcessEvent()
      break
    case 'rescheduleProcessEvent':
      rescheduleProcessEvent()
      break
    case 'scheduleRecurringEventFromTemplate':
      scheduleRecurringEventFromTemplate()
      break
    case 'cancelRecurringEventInstance':
      cancelRecurringEventInstance()
      break
    case 'rescheduleRecurringEventInstance':
      rescheduleRecurringEventInstance()
      break
    case 'updateRecurringEventSchedule':
      updateRecurringEventSchedule()
      break
    case 'cancelRecurringEvent':
      cancelRecurringEvent()
      break
    case 'scheduleProcessFromTemplate':
      scheduleProcessFromProcessTemplate()
      break
    case 'rescheduleUpcomingProcess':
      rescheduleUpcomingProcess()
      break
    case 'cancelUpcomingProcess':
      cancelUpcomingProcess()
      break
    case 'createTrustedViewerAccess':
      createTrustedViewerAccess()
      break
    case 'retrieveTrustedViewerUrl':
      retrieveTrustedViewerUrl()
      break
    case 'revokeTrustedViewerAccess':
      revokeTrustedViewerAccess()
      break
    default:
      throw new Error('Invalid choice')
  }
}

run().catch(console.error)
