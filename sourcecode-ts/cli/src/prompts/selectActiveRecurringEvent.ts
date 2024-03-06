import { formatRecurringEventSchedule } from '@calendar-from-cli/calendar-utils'
import { client } from '../globals/client'
import { fuzzySelect } from './generic/fuzzySelect'

type SelectActiveRecurringEventOpts = {
  fuzzySelectMessage: string
}

export const promptSelectActiveRecurringEvent = async ({ fuzzySelectMessage }: SelectActiveRecurringEventOpts) => {
  const availableActiveRecurringEvents = await client.recurringEvent.listActive.query()
  if (availableActiveRecurringEvents.length === 0) {
    throw new Error('No active recurring events found')
  }
  const { choice: recurringEvent } = await fuzzySelect(availableActiveRecurringEvents, {
    getValue: (obj) => obj,
    // @ts-expect-error type instantiation exceedingly infinite for some reason
    getFuzzyIndex: ({ Title, Recurrence }) => `${Title} (${formatRecurringEventSchedule(Recurrence)})`,
    getDescription: ({ Description }) => Description,
    defaultDescription: 'No description provided',
    messages: {
      fuzzySelectMessage,
    },
  })
  return recurringEvent
}
