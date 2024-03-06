import { client } from '../globals/client'
import { fuzzySelect } from './generic/fuzzySelect'

type SelectActiveProcessOpts = {
  fuzzySelectMessage: string
}

export const promptSelectUpcomingProcess = async ({ fuzzySelectMessage }: SelectActiveProcessOpts) => {
  const availableActiveProcesses = await client.process.listUpcoming.query()
  if (availableActiveProcesses.length === 0) {
    throw new Error('No upcoming processes found')
  }
  const { choice: process } = await fuzzySelect(availableActiveProcesses, {
    getValue: (obj) => obj,
    getFuzzyIndex: ({ Title, StartsAtUTC }) => `${Title} (Starts at - ${new Date(StartsAtUTC).toLocaleString()})})`,
    getDescription: ({ Description }) => Description,
    defaultDescription: 'No description provided',
    messages: {
      fuzzySelectMessage,
    },
  })
  return process
}
