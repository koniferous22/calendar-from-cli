import { client } from '../globals/client'
import { selectEventFromCalendar } from '../prompts/selectEventFromCalendar'

export const cancelEvent = async () => {
  const event = await selectEventFromCalendar({
    fuzzySelectMessage: 'Select Event to Cancel',
  })
  return client.event.cancel.mutate({ id: event.Id })
}
