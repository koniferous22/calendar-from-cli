import { processItemStatus } from '@calendar-from-cli/calendar-utils'
import { promptListCalendarItems } from './listCalendarItems'
import { fuzzySelect } from './generic/fuzzySelect'

type SelectProcessEventFromCalendarOpts = {
  fuzzySelectMessage: string
}

export const selectProcessEventFromCalendar = async ({ fuzzySelectMessage }: SelectProcessEventFromCalendarOpts) => {
  const now = new Date()
  const calendarItems = await promptListCalendarItems()
  // @ts-expect-error type instantiation possibly infinite
  const availableEvents = calendarItems.filter(({ type }) => type === 'processEvent') as Extract<
    (typeof calendarItems)[number],
    { type: 'processEvent' }
  >[]
  if (calendarItems.length === 0) {
    throw new Error('No process events found')
  }
  const { choice: event } = await fuzzySelect(availableEvents, {
    getValue: (obj) => obj.event,
    getFuzzyIndex: ({ event, processInfo }) =>
      `[${new Date(event.ScheduledAtUTC).toLocaleString()} - ${new Date(event.EndsAtUTC).toLocaleString()}] - ${
        event.Title
      } ${processItemStatus.formatProcessItemStatus(
        processInfo.canonicalEventOrderInProcess,
        processInfo.processItemCount,
        processInfo.process.Title,
        new Date(processInfo.process.StartsAtUTC),
        now,
      )}`,
    getDescription: ({ event }) => event.Description,
    defaultDescription: 'No description provided',
    messages: {
      fuzzySelectMessage,
    },
  })
  return event
}
