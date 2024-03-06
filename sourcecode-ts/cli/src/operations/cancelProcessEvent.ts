import { client } from '../globals/client'
import { selectEnumPrompt } from '../prompts/generic/selectEnum'
import { cancelProcessItemSubsequentItemsBehaviour } from '../options/processUpdateSubsequentItemBehaviour'
import { selectProcessEventFromCalendar } from '../prompts/selectProcessEventFromCalendar'

export const cancelProcessEvent = async () => {
  const processEvent = await selectProcessEventFromCalendar({
    fuzzySelectMessage: 'Select Process Event to Cancel',
  })
  const subsequentProcessItemsBehaviour = (
    await selectEnumPrompt(
      cancelProcessItemSubsequentItemsBehaviour,
      'Cancelling Process Event impacts further events tied to the process, what should be done with them?',
    )
  ).choice
  return client.process.cancelItem.mutate({
    itemAttachmentId: processEvent.EventSourceReference.ProcessItemAttachmentId!,
    subsequentProcessItemsBehaviour,
  })
}
