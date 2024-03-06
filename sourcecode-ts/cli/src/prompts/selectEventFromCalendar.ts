import { promptListCalendarItems } from './listCalendarItems'
import { fuzzySelect } from './generic/fuzzySelect'

type SelectEventFromCalendarOpts = {
  fuzzySelectMessage: string
}

export const selectEventFromCalendar = async ({ fuzzySelectMessage }: SelectEventFromCalendarOpts) => {
  const calendarItems = await promptListCalendarItems()
  // @ts-expect-error type instantiation possibly infinite
  const availableEvents = (
    calendarItems.filter(({ type }) => type === 'event') as Extract<(typeof calendarItems)[number], { type: 'event' }>[]
  ).map(({ event }) => event)
  if (calendarItems.length === 0) {
    throw new Error('No events found')
  }
  const { choice: event } = await fuzzySelect(availableEvents, {
    getValue: (obj) => obj,
    getFuzzyIndex: ({ ScheduledAtUTC, EndsAtUTC, Title }) =>
      `[${ScheduledAtUTC.toLocaleString()} - ${EndsAtUTC.toLocaleString()}] - ${Title}`,
    getDescription: ({ Description }) => Description,
    defaultDescription: 'No description provided',
    messages: {
      fuzzySelectMessage,
    },
  })
  return event
}
