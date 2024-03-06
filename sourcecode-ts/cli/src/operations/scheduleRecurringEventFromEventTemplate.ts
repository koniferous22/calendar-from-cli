import { hourMinuteOptions } from '../options/datetimeOptions'
import { fuzzySelect } from '../prompts/generic/fuzzySelect'
import { client } from '../globals/client'
import { promptRecurringEventSchedule } from '../prompts/recurringEventSchedule'

export const scheduleRecurringEventFromTemplate = async () => {
  const availableEventTemplates = await client.eventTemplate.list.query()
  const { choice: alias } = await fuzzySelect(availableEventTemplates, {
    getValue: (obj) => obj.Alias,
    getFuzzyIndex: (obj) => `"${obj.Alias}" - ${obj.Title}`,
    getDescription: (obj) => obj.Description ?? undefined,
    defaultDescription: 'No description provided',
    messages: {
      fuzzySelectMessage: 'Select event template',
    },
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
  return client.eventTemplate.scheduleRecurringEvent.mutate({
    recurringEventSchedule: {
      hour,
      minute,
      // TRPC for some reason expects non-empty array
      dayRecurrence: recurringEventSchedule as any,
    },
    alias,
    startInstancesSince: new Date().toISOString(),
  })
}
