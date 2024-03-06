import inquirer from 'inquirer'
import { client } from '../globals/client'
import { promptSelectActiveRecurringEvent } from '../prompts/selectActiveRecurringEvent'

export const cancelRecurringEvent = async () => {
  const recurringEvent = await promptSelectActiveRecurringEvent({
    fuzzySelectMessage: 'Select Event to Cancel',
  })
  const { shouldCancelConvertedEvents } = await inquirer.prompt<{ shouldCancelConvertedEvents: boolean }>([
    {
      type: 'confirm',
      name: 'shouldCancelConvertedEvents',
      message: 'Do you want to cancel standalone events originating from this event?',
    },
  ])
  return client.recurringEvent.cancel.mutate({
    id: recurringEvent.Id,
    shouldCancelConvertedEvents,
  })
}
