import { ReactNode, useEffect, useState } from 'react'
import { useAuthContext } from '../context/Auth'
import { AuthModal, hooks } from '@calendar-from-cli/ui-components'
import { useAppSearchParamsContext } from '../context/AppSearchParams'
import { useUserSettingsContext } from '../context/UserSettings'
import { getConfig } from '../config/config'
import { useLoaderContext } from '@calendar-from-cli/ui-components/dist/hooks'

const AuthModalComponent = () => {
  const { viewerUuid } = useAppSearchParamsContext()
  const { authError, clearAuthError, isAuthFormLoading: isAuthLoading, signIn } = useAuthContext()
  const { updateWebAppSettings } = useUserSettingsContext()
  const { modalState, closeModalHandler, openModalHandler } = hooks.useModalState()
  const [pwdInput, setPwdInput] = useState('')
  useEffect(() => {
    openModalHandler()
  }, [])
  return (
    <AuthModal
      errorMessage={authError ?? undefined}
      isAuthLoading={isAuthLoading}
      modalState={modalState}
      onModalClose={closeModalHandler}
      onErrorBannerClose={clearAuthError}
      onPwdChange={(value) => setPwdInput(value)}
      onSubmit={() => {
        signIn(viewerUuid!, pwdInput).then((response) => {
          const webAppSettings = response?.webAppSettings
          if (webAppSettings) {
            updateWebAppSettings(webAppSettings)
          }
        })
      }}
      shouldDisallowClosing={getConfig().auth.modal.shouldDisallowClosing}
    />
  )
}

type Props = {
  children?: ReactNode
}

export const Layout = ({ children }: Props) => {
  const [isLayoutReady, setLayoutReady] = useState(false)
  const {
    permissionsView,
    resolveTimezoneView,
    setPermissionsView,
    setTheme,
    setTimezone,
    theme: themeFromSearchParams,
  } = useAppSearchParamsContext()
  const { showLoader } = useLoaderContext()
  const { isAuthRefreshLoading, shouldPromptAuth } = useAuthContext()
  useEffect(() => {
    showLoader()
    setPermissionsView(permissionsView)
    // Sync resolved settings to Query string
    setTheme(themeFromSearchParams)
    setTimezone(resolveTimezoneView())
    setLayoutReady(() => {
      return true
    })
  }, [])
  return (
    <>
      {!isAuthRefreshLoading && shouldPromptAuth && <AuthModalComponent />}
      {isLayoutReady && children}
    </>
  )
}
