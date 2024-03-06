import { createContext, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getConfig } from '../config/config'
import { primitives } from '@calendar-from-cli/validation-lib'
import { z } from 'zod'
import { hooks } from '@calendar-from-cli/ui-components'

type TimezoneViewFromCalendarCtx = ReturnType<typeof hooks.useCalendarViewContext>['ctx']['timezoneView']

const useAppSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const themeFromSearchParams = primitives.zTheme
    .default(getConfig().defaultWebAppSettings.theme)
    .catch(getConfig().defaultWebAppSettings.theme)
    .parse(searchParams.get('theme'))
  const viewerUuidFromSearchParams = searchParams.get('viewerUuid')
  const permissionsViewFromSearchParams = primitives.zCalendarPermissionView
    .default('public')
    .catch('public')
    .parse(searchParams.get('permissionsView'))
  const timezoneViewFromSearchParams = primitives.zCalendarTimezoneView
    .default('client')
    .catch('client')
    .parse(searchParams.get('timezoneView'))
  const timezoneFromSearchParams = searchParams.get('timezone')

  const defaultTheme = getConfig().defaultWebAppSettings.theme
  const setTheme = (theme: typeof defaultTheme) => {
    document.getElementsByTagName('html')[0].setAttribute('data-theme', theme)
    setSearchParams((prevSearchParams) => {
      prevSearchParams.set('theme', theme)
      return prevSearchParams
    })
  }
  const setPermissionsView = (permissionsView: z.infer<typeof primitives.zCalendarPermissionView>) =>
    setSearchParams((prevSearchParams) => {
      prevSearchParams.set('permissionsView', permissionsView)
      return prevSearchParams
    })
  const setViewerUuid = (viewerUuid: string) =>
    setSearchParams((prevSearchParams) => {
      prevSearchParams.set('viewerUuid', viewerUuid)
      return prevSearchParams
    })
  const setTimezone = (timezoneFromCtx: TimezoneViewFromCalendarCtx) =>
    setSearchParams((prevSearchParams) => {
      switch (timezoneFromCtx.type) {
        case 'ownerTimezone':
          prevSearchParams.delete('timezone')
          prevSearchParams.set('timezoneView', 'owner')
          break
        case 'clientTimezone':
          prevSearchParams.delete('timezone')
          prevSearchParams.set('timezoneView', 'client')
          break
        case 'custom':
          prevSearchParams.set('timezone', timezoneFromCtx.timezone)
          break
      }
      return prevSearchParams
    })
  const resolveTimezoneView = (): TimezoneViewFromCalendarCtx => {
    if (timezoneFromSearchParams) {
      return {
        type: 'custom',
        timezone: timezoneFromSearchParams,
      }
    }
    switch (timezoneViewFromSearchParams) {
      case 'owner':
        return {
          type: 'ownerTimezone',
        }
      case 'client':
        return {
          type: 'clientTimezone',
        }
    }
  }
  return {
    theme: themeFromSearchParams,
    viewerUuid: viewerUuidFromSearchParams,
    // Note - permissions view is relevant only when user is logged in
    permissionsView: permissionsViewFromSearchParams,
    resolveTimezoneView,
    queryString: searchParams.toString(),
    setPermissionsView,
    setTheme,
    setTimezone,
    setViewerUuid,
  }
}

const AppSearchParamsContext = createContext<ReturnType<typeof useAppSearchParams>>(null as any)

type Props = {
  children?: React.ReactNode
}

export const AppSearchParamsProvider = ({ children }: Props) => {
  const ctxValue = useAppSearchParams()
  return <AppSearchParamsContext.Provider value={ctxValue}>{children}</AppSearchParamsContext.Provider>
}

export const useAppSearchParamsContext = () => useContext(AppSearchParamsContext)
