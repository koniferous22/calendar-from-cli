import { client } from '../globals/client'
import { fuzzySelect } from './generic/fuzzySelect'

type SelectActiveTrustedViewerOpts = {
  fuzzySelectMessage: string
}

export const promptSelectActiveTrustedViewer = async ({ fuzzySelectMessage }: SelectActiveTrustedViewerOpts) => {
  const availableActiveRecurringEvents = await client.trustedViewer.listActive.query()
  if (availableActiveRecurringEvents.length === 0) {
    throw new Error('No active trusted viewers grants found')
  }
  const { choice: trustedViewer } = await fuzzySelect(availableActiveRecurringEvents, {
    getValue: (obj) => obj,
    getFuzzyIndex: ({ Alias }) => `${Alias}`,
    getDescription: ({ ViewerUuid, GrantExpiresAt }) =>
      `${ViewerUuid}${GrantExpiresAt ? ` - (Expires at ${new Date(GrantExpiresAt).toLocaleString()})` : ''}`,
    defaultDescription: 'No description provided',
    messages: {
      fuzzySelectMessage,
    },
  })
  return trustedViewer
}
