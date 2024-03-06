import { RouterProvider, json } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './trpc/queryClient.js'
import { createBrowserRouter } from 'react-router-dom'
import { CalendarPage } from './pages/CalendarPage.js'
import { getConfigurables } from './config/configurables.js'
import { Layout } from './components/Layout.js'
import { AppSearchParamsProvider } from './context/AppSearchParams.js'
import { AuthProvider } from './context/Auth.js'
import { UserSettingsProvider } from './context/UserSettings.js'
import { getAccessTokenPermissions } from './trpc/auth.js'
import { calendarRangeIdentifier } from '@calendar-from-cli/calendar-utils'
import { resolveClientTimezone } from './browser-api/intl.js'
import { CalendarPageErrorBoundary } from './error-handling/CalendarPageErrorBoundary.js'
import { HomePage } from './pages/HomePage.js'
import { RouterErrorBoundary } from './error-handling/RouterErrorBoundary.js'
import { types } from '@calendar-from-cli/validation-lib'
import { LoaderProvider } from '@calendar-from-cli/ui-components/dist/context/loader.js'
import { getConfig } from './config/config.js'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppSearchParamsProvider>
        <AuthProvider>
          <UserSettingsProvider>
            <LoaderProvider shouldDisplayLoaderOverlay={getConfig().pageLoader === 'overlay'}>
              <Layout>
                {/* Note - 'HomePage' conditionally renders <Outlet /> for child routes */}
                <HomePage />
              </Layout>
            </LoaderProvider>
          </UserSettingsProvider>
        </AuthProvider>
      </AppSearchParamsProvider>
    ),
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        path: 'month/:year/:month',
        loader: ({ params }) => {
          const { year, month } = params
          const parsingResult = getConfigurables().validators.urlInput.zUrlCalendarRangeIdentifier.safeParse({
            type: 'monthCellView',
            identifier: {
              year,
              month,
            },
          })
          if (!parsingResult.success) {
            throw json<types.CalendarPageError>(
              {
                type: 'invalidRangeIdentifier',
              },
              {
                status: 400,
              },
            )
          }
          const canAccessIdentifier =
            !!getAccessTokenPermissions()?.calendarPermissions?.canViewPast ||
            calendarRangeIdentifier.validateCalendarRangeIdentifierNotPast(
              parsingResult.data,
              resolveClientTimezone(),
              new Date(),
            )
          if (!canAccessIdentifier) {
            throw json<types.CalendarPageError>(
              {
                type: 'unauthorizedPastAccess',
                pathIdentifier: calendarRangeIdentifier.calendarRangeIdentifierToPathname(parsingResult.data),
              },
              {
                status: 403,
              },
            )
          }
          return parsingResult.data
        },
        element: <CalendarPage />,
        errorElement: <CalendarPageErrorBoundary />,
      },
      {
        path: 'week/:year/:month/:dayOfMonth',
        loader: ({ params }) => {
          const { year, month, dayOfMonth } = params
          const parsingResult = getConfigurables().validators.urlInput.zUrlCalendarRangeIdentifier.safeParse({
            type: 'weekLaneView',
            identifier: {
              year,
              month,
              dayOfMonth,
            },
          })
          if (!parsingResult.success) {
            throw json<types.CalendarPageError>(
              {
                type: 'invalidRangeIdentifier',
              },
              {
                status: 400,
              },
            )
          }
          const canAccessIdentifier =
            !!getAccessTokenPermissions()?.calendarPermissions?.canViewPast ||
            calendarRangeIdentifier.validateCalendarRangeIdentifierNotPast(
              parsingResult.data,
              resolveClientTimezone(),
              new Date(),
            )
          if (!canAccessIdentifier) {
            throw json<types.CalendarPageError>(
              {
                type: 'unauthorizedPastAccess',
                pathIdentifier: calendarRangeIdentifier.calendarRangeIdentifierToPathname(parsingResult.data),
              },
              {
                status: 403,
              },
            )
          }
          return parsingResult.data
        },
        element: <CalendarPage />,
        errorElement: <CalendarPageErrorBoundary />,
      },
      {
        path: 'day/:year/:month/:dayOfMonth',
        loader: ({ params }) => {
          const { year, month, dayOfMonth } = params
          const parsingResult = getConfigurables().validators.urlInput.zUrlCalendarRangeIdentifier.safeParse({
            type: 'dayLaneView',
            identifier: {
              year,
              month,
              dayOfMonth,
            },
          })
          if (!parsingResult.success) {
            throw json<types.CalendarPageError>(
              {
                type: 'invalidRangeIdentifier',
              },
              {
                status: 400,
              },
            )
          }
          const canAccessIdentifier =
            !!getAccessTokenPermissions()?.calendarPermissions?.canViewPast ||
            calendarRangeIdentifier.validateCalendarRangeIdentifierNotPast(
              parsingResult.data,
              resolveClientTimezone(),
              new Date(),
            )
          if (!canAccessIdentifier) {
            throw json<types.CalendarPageError>(
              {
                type: 'unauthorizedPastAccess',
                pathIdentifier: calendarRangeIdentifier.calendarRangeIdentifierToPathname(parsingResult.data),
              },
              {
                status: 403,
              },
            )
          }
          return parsingResult.data
        },
        element: <CalendarPage />,
        errorElement: <CalendarPageErrorBoundary />,
      },
    ],
  },
])

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
