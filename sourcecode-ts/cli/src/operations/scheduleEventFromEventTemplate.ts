import { client } from '../globals/client'
import { promptFutureDatetime } from '../prompts/generic/futureDatetime'
import { promptSelectEventTemplate } from '../prompts/selectEventTemplate'

export const scheduleEventFromEventTemplate = async () => {
  const alias = (await promptSelectEventTemplate()).Alias
  const scheduledAtUTC = await promptFutureDatetime({
    pastInputErrorMessage: 'Cannot schedule in the past',
    promptMessage: 'Select date for the event',
  })
  return client.eventTemplate.scheduleEvent.mutate({
    scheduledAtUTC: scheduledAtUTC.toISOString(),
    alias,
  })
}
