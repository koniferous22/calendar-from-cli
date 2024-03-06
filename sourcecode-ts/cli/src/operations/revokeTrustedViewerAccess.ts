import { client } from '../globals/client'
import { promptSelectActiveTrustedViewer } from '../prompts/selectActiveTrustedViewer'

export const revokeTrustedViewerAccess = async () => {
  const trustedViewer = await promptSelectActiveTrustedViewer({
    fuzzySelectMessage: 'Choose Trusted Viewer Grant',
  })
  return client.trustedViewer.revokeAccess.mutate({
    viewerUuid: trustedViewer.ViewerUuid,
  })
}
