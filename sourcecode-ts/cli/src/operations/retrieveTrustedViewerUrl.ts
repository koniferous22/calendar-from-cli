import { getConfig } from '../globals/config'
import { promptSelectActiveTrustedViewer } from '../prompts/selectActiveTrustedViewer'

export const retrieveTrustedViewerUrl = async () => {
  const trustedViewer = await promptSelectActiveTrustedViewer({
    fuzzySelectMessage: 'Choose Trusted Viewer Grant',
  })
  const searchParams = new URLSearchParams({
    viewerUuid: trustedViewer.ViewerUuid,
    permissionsView: 'protected',
  })
  console.log(`${getConfig().webAppDomain}?${searchParams.toString()}`)
}
