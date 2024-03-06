import { client } from '../globals/client'
import { selectRecurringEventInstanceFromCalendar } from '../prompts/selectRecurringEventInstanceFromCalendar'

export const cancelRecurringEventInstance = async () => {
  const recurringEventInstance = await selectRecurringEventInstanceFromCalendar({
    fuzzySelectMessage: 'Select Recurring Event to Cancel',
  })
  return client.recurringEvent.cancelInstance.mutate({
    instanceId: recurringEventInstance.Id,
  })
}
