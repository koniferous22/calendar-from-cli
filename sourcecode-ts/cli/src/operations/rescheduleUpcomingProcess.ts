import { client } from '../globals/client'
import { promptFutureDatetime } from '../prompts/generic/futureDatetime'
import { promptSelectUpcomingProcess } from '../prompts/selectUpcomingProcess'

export const rescheduleUpcomingProcess = async () => {
  const process = await promptSelectUpcomingProcess({
    fuzzySelectMessage: 'Select Process to Reschedule',
  })
  const scheduleBaselineUTC = await promptFutureDatetime({
    pastInputErrorMessage: 'Cannot schedule process in the past',
    promptMessage: 'Enter baseline datetime for the process',
  })
  return client.process.rescheduleUpcoming.mutate({
    id: process.Id,
    scheduleBaselineUTC: scheduleBaselineUTC.toISOString(),
  })
}
