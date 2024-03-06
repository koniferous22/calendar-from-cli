import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { error as errorParsers } from '@calendar-from-cli/validation-lib'
import { CalendarPageRedirect } from '../redirects/CalendarPageRedirect'

export const CalendarPageErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    const errorParsingResult = errorParsers.zCalendarPageError.safeParse(error.data)
    if (errorParsingResult.success) {
      return (
        <CalendarPageRedirect
          passedState={{
            errors: [errorParsingResult.data],
          }}
        />
      )
    }
  }
  // rethrow to parent error boundary if error not recognized
  throw error
}
