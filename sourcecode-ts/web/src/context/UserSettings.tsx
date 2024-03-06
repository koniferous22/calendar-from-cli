import { ReactNode, createContext, useContext, useState } from 'react'
import { useAppSearchParamsContext } from './AppSearchParams'
import { getConfig } from '../config/config'

const useUserSettings = () => {
  const [webAppSettings, setWebAppSettings] = useState(getConfig().defaultWebAppSettings)
  const { setTheme } = useAppSearchParamsContext()
  const updateWebAppSettings = (newWebAppSettings: typeof webAppSettings) => {
    setTheme(newWebAppSettings.theme)
    setWebAppSettings(newWebAppSettings)
  }
  const updateTheme = (newTheme: (typeof webAppSettings)['theme']) => {
    setTheme(newTheme)
    setWebAppSettings((prevWebAppSettings) => ({
      ...prevWebAppSettings,
      theme: newTheme,
    }))
  }
  return {
    webAppSettings,
    updateWebAppSettings,
    updateTheme,
  }
}

const UserSettingsContext = createContext<ReturnType<typeof useUserSettings>>(null as any)

type Props = {
  children?: ReactNode
}

export const UserSettingsProvider = ({ children }: Props) => {
  const ctxValue = useUserSettings()
  return <UserSettingsContext.Provider value={ctxValue}>{children}</UserSettingsContext.Provider>
}

export const useUserSettingsContext = () => useContext(UserSettingsContext)
