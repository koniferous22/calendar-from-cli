import { client } from '../globals/client'
import { promptSelectUpcomingProcess } from '../prompts/selectUpcomingProcess'

export const cancelUpcomingProcess = async () => {
  const process = await promptSelectUpcomingProcess({
    fuzzySelectMessage: 'Select Process to Cancel',
  })
  return client.process.cancelUpcoming.mutate({
    id: process.Id,
  })
}
