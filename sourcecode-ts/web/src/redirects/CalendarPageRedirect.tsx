import { Navigate } from 'react-router-dom'
import { types } from '@calendar-from-cli/validation-lib'
import { resolveViewportScreenSize } from '../browser-api/window'
import { calendarRangeIdentifier } from '@calendar-from-cli/calendar-utils'
import { useUserSettingsContext } from '../context/UserSettings'
import { useAppSearchParamsContext } from '../context/AppSearchParams'

type Props = {
  passedState?: {
    errors?: types.CalendarPageError[]
  }
}

export const CalendarPageRedirect = ({ passedState }: Props) => {
  // Note - query string required for preserving 'viewerUuid' in case present in URL
  const { queryString } = useAppSearchParamsContext()
  const { webAppSettings } = useUserSettingsContext()
  const { smHomeRedirect, homeRedirect } = webAppSettings
  const screenSize = resolveViewportScreenSize()
  const redirectToSmallDevices = calendarRangeIdentifier.calendarRangeIdentifierFromDate(new Date(), homeRedirect)
  const redirectToSm = calendarRangeIdentifier.calendarRangeIdentifierFromDate(new Date(), smHomeRedirect)
  if (!screenSize) {
    // Note - for screen sizes less than 640 , screenSize is undefined
    return (
      <Navigate
        to={{
          pathname: calendarRangeIdentifier.calendarRangeIdentifierToPathname(redirectToSmallDevices),
          search: queryString,
        }}
        state={passedState}
      />
    )
  }
  return (
    <Navigate
      to={{
        pathname: calendarRangeIdentifier.calendarRangeIdentifierToPathname(redirectToSm),
        search: queryString,
      }}
      state={passedState}
    />
  )
}
