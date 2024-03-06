import { client } from '../globals/client'
import { promptOptionalEventScheduleUpdates } from '../prompts/eventSchedule'
import { selectRecurringEventInstanceFromCalendar } from '../prompts/selectRecurringEventInstanceFromCalendar'

export const rescheduleRecurringEventInstance = async () => {
  const recurringEventInstance = await selectRecurringEventInstanceFromCalendar({
    fuzzySelectMessage: 'Select Recurring Event to Cancel',
  })
  const { duration: durationOverride, scheduledAtUTC: scheduledAtUTCOverride } =
    await promptOptionalEventScheduleUpdates({
      timestampPromptMessage: 'Do you want to update event scheduled time?',
      durationPromptMessage: `Do you want to update scheduled event duration?`,
    })
  return client.recurringEvent.rescheduleInstance.mutate({
    instanceId: recurringEventInstance.Id,
    durationOverride,
    scheduledAtUTCOverride: scheduledAtUTCOverride?.toISOString?.(),
  })
}
