import { useLoaderData, useLocation } from 'react-router-dom'
import { CalendarViewProvider, LinkComponent, CalendarBanners } from '@calendar-from-cli/ui-components'
import { types } from '@calendar-from-cli/validation-lib'
import { useAppSearchParamsContext } from '../context/AppSearchParams'
import { getConfig } from '../config/config'
import { useEffect, useState } from 'react'
import { Calendar } from '../components/Calendar'
import { CalendarHeader } from '../components/CalendarHeader'
import { getAccessTokenPermissions } from '../trpc/auth'
import { historyPushCalendarRangeView } from '../browser-api/history'
import { resolveClientTimezone } from '../browser-api/intl'
import { CalendarPageRedirect } from '../redirects/CalendarPageRedirect'

type PassedState = Parameters<typeof CalendarPageRedirect>[0]['passedState']

const formatErrorBannerMessage = (incomingError: types.CalendarPageError) => {
  switch (incomingError.type) {
    case 'invalidRangeIdentifier':
      return '(redirected) Invalid calendar range identifier'
    case 'unauthorizedPastAccess':
      return `(redirected) Unauthorized past resource access "${incomingError.pathIdentifier}"`
  }
}

const FooterLink = () => {
  return (
    <div className="mt-20 ml-5">
      <a href={getConfig().secretLinkHref}>
        <LinkComponent linkText={getConfig().defaultWebAppSettings.secretLinkText} />
      </a>
    </div>
  )
}

export const CalendarPage = () => {
  const location = useLocation()
  const passedState: PassedState = location.state
  const { permissionsView, setPermissionsView, resolveTimezoneView, setTimezone } = useAppSearchParamsContext()
  const [now, setNow] = useState(new Date().getTime())
  const syncNowFrequency = getConfig().calendar.syncCurrentTimeFrequencySeconds * 1000
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date().getTime())
    }, syncNowFrequency)
    return () => clearInterval(interval)
  }, [])
  const initialIdentifier = useLoaderData() as types.CalendarRangeIdentifier
  return (
    <CalendarViewProvider
      options={{
        resolvers: {
          resolveNow: () => new Date(now),
          timezone: {
            resolveOwnerTimezone: () => getConfig().timezone,
            resolveClientTimezone,
          },
          resolveCanAccessPast: () => !!getAccessTokenPermissions()?.calendarPermissions?.canViewPast,
        },
        effects: {
          onCalendarRangeViewChanged: historyPushCalendarRangeView,
          onCalendarPermissionsViewChange: ({ type }) => setPermissionsView(type),
          onCalendarTimezoneViewChanged: setTimezone,
        },
        initialState: {
          now: new Date(now),
          rangeView: initialIdentifier,
          timezoneView: resolveTimezoneView(),
          permissionsView: {
            type: permissionsView,
          },
        },
      }}
    >
      <CalendarHeader />
      <CalendarBanners errorBannerMessages={passedState?.errors?.map(formatErrorBannerMessage) ?? []} />
      <Calendar />
      <FooterLink />
    </CalendarViewProvider>
  )
}
