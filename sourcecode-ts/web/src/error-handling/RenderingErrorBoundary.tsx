import { CenteredFixedText } from '@calendar-from-cli/ui-components'
import { getConfig } from '../config/config'

export const RenderingErrorBoundary = () => {
  return <CenteredFixedText text={getConfig().uiErrorHandling.renderingErrorBoundary.errorFallback} />
}
