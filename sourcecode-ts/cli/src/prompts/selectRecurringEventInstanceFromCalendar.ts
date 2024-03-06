import { promptListCalendarItems } from './listCalendarItems'
import { fuzzySelect } from './generic/fuzzySelect'

type SelectRecurringEventInstanceFromCalendarOpts = {
  fuzzySelectMessage: string
}

export const selectRecurringEventInstanceFromCalendar = async ({
  fuzzySelectMessage,
}: SelectRecurringEventInstanceFromCalendarOpts) => {
  const calendarItems = await promptListCalendarItems()
  // @ts-expect-error type instantiation possibly infinite
  const availableRecurringEventInstances = calendarItems.filter(({ type }) => type === 'recurringEvent') as Extract<
    (typeof calendarItems)[number],
    { type: 'recurringEvent' }
  >[]
  if (calendarItems.length === 0) {
    throw new Error('No recurring events found')
  }
  const { choice: recurringEventInstance } = await fuzzySelect(availableRecurringEventInstances, {
    getValue: (obj) => obj,
    getFuzzyIndex: ({ utcScheduledAt, utcEndsAt, recurringEvent }) =>
      `[${utcScheduledAt.toLocaleString()} - ${utcEndsAt.toLocaleString()}] - ${recurringEvent.RecurringEvent.Title}`,
    getDescription: ({ recurringEvent }) => recurringEvent.RecurringEvent.Description,
    defaultDescription: 'No description provided',
    messages: {
      fuzzySelectMessage,
    },
  })
  return recurringEventInstance.recurringEvent
}
