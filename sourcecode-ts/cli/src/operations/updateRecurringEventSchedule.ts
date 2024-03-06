import inquirer from 'inquirer'
import { promptSelectActiveRecurringEvent } from '../prompts/selectActiveRecurringEvent'
import { client } from '../globals/client'
import { promptOptionalEventScheduleUpdates } from '../prompts/eventSchedule'
import { hourMinuteOptions } from '../options/datetimeOptions'
import { fuzzySelect } from '../prompts/generic/fuzzySelect'
import { promptRecurringEventSchedule } from '../prompts/recurringEventSchedule'

export const updateRecurringEventSchedule = async () => {
  const recurringEvent = await promptSelectActiveRecurringEvent({
    fuzzySelectMessage: 'Select Recurring Event',
  })
  const recurringEventSchedule = await promptRecurringEventSchedule()
  const { choice: hourMinute } = await fuzzySelect(hourMinuteOptions, {
    getValue: (obj) => obj.value,
    getFuzzyIndex: (obj) => obj.name,
    getDescription: (obj) => obj.name,
    defaultDescription: 'Out of range',
    messages: {
      fuzzySelectMessage: 'Choose time for recurring event',
    },
  })
  const [hour, minute] = hourMinute
  const { duration: durationOverride, scheduledAtUTC: startSinceOverride } = await promptOptionalEventScheduleUpdates({
    timestampPromptMessage: 'Do you want to adjust recurring event start time?',
    durationPromptMessage: 'Do you want to adjust recurring event duration?',
  })
  const { shouldCancelConvertedEvents } = await inquirer.prompt<{ shouldCancelConvertedEvents: boolean }>([
    {
      type: 'confirm',
      name: 'shouldCancelConvertedEvents',
      message: 'Do you want to cancel standalone events originating from previous recurring event schedule?',
    },
  ])
  return client.recurringEvent.updateSchedule.mutate({
    id: recurringEvent.Id,
    shouldCancelConvertedEvents,
    recurringEventSchedule: {
      hour,
      minute,
      dayRecurrence: recurringEventSchedule as any,
    },
    durationOverride,
    startSinceOverride: startSinceOverride?.toISOString?.(),
  })
}
