import { CenteredFixedText } from '@calendar-from-cli/ui-components'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { getConfig } from '../config/config'

export const RouterErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <CenteredFixedText text={getConfig().uiErrorHandling.routerErrorBoundary.errorText404} />
    }

    if (error.status === 403) {
      return <CenteredFixedText text={getConfig().uiErrorHandling.routerErrorBoundary.errorText403} />
    }
  }

  return <CenteredFixedText text={getConfig().uiErrorHandling.routerErrorBoundary.errorFallback} />
}
