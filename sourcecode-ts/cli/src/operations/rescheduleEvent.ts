import { client } from '../globals/client'
import { promptEventScheduleDefaultDuration } from '../prompts/eventSchedule'
import { selectEventFromCalendar } from '../prompts/selectEventFromCalendar'

export const rescheduleEvent = async () => {
  const event = await selectEventFromCalendar({
    fuzzySelectMessage: 'Select Event to Reschedule',
  })
  const { duration, scheduledAtUTC } = await promptEventScheduleDefaultDuration(event.Duration)
  return client.event.updateSchedule.mutate({
    id: event.Id,
    scheduledAtUTC: scheduledAtUTC.toISOString(),
    duration,
  })
}
