import { client } from '../globals/client'
import { promptEventScheduleDefaultDuration } from '../prompts/eventSchedule'
import { selectEnumPrompt } from '../prompts/generic/selectEnum'
import { rescheduleProcessItemSubsequentItemsBehaviour } from '../options/processUpdateSubsequentItemBehaviour'
import { selectProcessEventFromCalendar } from '../prompts/selectProcessEventFromCalendar'

export const rescheduleProcessEvent = async () => {
  const event = await selectProcessEventFromCalendar({
    fuzzySelectMessage: 'Select Event to Reschedule',
  })
  const { duration, scheduledAtUTC } = await promptEventScheduleDefaultDuration(event.Duration)
  const subsequentProcessItemsBehaviour = (
    await selectEnumPrompt(
      rescheduleProcessItemSubsequentItemsBehaviour,
      'Rescheduling Process Event impacts further events tied to the process, what should be done with them?',
    )
  ).choice
  return client.process.rescheduleItem.mutate({
    duration,
    scheduledAtUTC: scheduledAtUTC.toISOString(),
    itemAttachmentId: event.EventSourceReference.ProcessItemAttachmentId!,
    subsequentProcessItemsBehaviour,
  })
}
