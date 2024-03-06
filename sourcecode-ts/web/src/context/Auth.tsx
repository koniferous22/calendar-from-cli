import { createContext, useContext, useEffect, useState } from 'react'
import type { inferRouterOutputs } from '@trpc/server'
import { useAppSearchParamsContext } from './AppSearchParams'
import { ApiError, trpcClient } from '../trpc/trpc'
import { getAccessTokenPermissions, isLoggedIn, setAccessToken } from '../trpc/auth'
import { clearRefreshToken, storeRefreshToken } from '../browser-api/localStorage'
import { getConfig } from '../config/config'
import type { AppRouter } from '../../../api/public/src'
import { useMutation } from '@tanstack/react-query'

type ApiAuthResponse = inferRouterOutputs<AppRouter>['trustedViewer']['authenticate']

const useAuth = () => {
  const {
    viewerUuid: viewerUuidFromSettings,
    permissionsView: permissionsViewFromSettings,
    setPermissionsView,
    setViewerUuid,
  } = useAppSearchParamsContext()
  const [isAuthRefreshLoading, setAuthRefreshLoading] = useState(false)
  const [authError, setAuthError] = useState<null | string>(null)
  const [shouldPromptAuth, setShouldPromptAuth] = useState(false)
  const validateUuidMutation = useMutation({
    mutationFn: trpcClient.trustedViewer.validate.mutate,
    retry: 0,
  })
  const refreshTokenMutation = useMutation({
    mutationFn: trpcClient.trustedViewer.refreshToken.mutate,
    retry: 0,
  })
  const authenticateMutation = useMutation({
    mutationFn: trpcClient.trustedViewer.authenticate.mutate,
    retry: 0,
  })

  // Note - state to take into consideration with auth methods
  // 1. accessToken closure (trpc/trpc.ts)
  // 2. refreshToken closure (trpc/trpc.ts)
  // 3. useAppQuerySettings - viewerUuid
  // 4. useAppQuerySettings - permissionsView
  //   * example - signing in should automatically switch the view to protected
  // 5. useState - authError
  // 6. useState - shouldPromptAuth
  //   * relevant for auth modal
  const handleAuthSuccess = (authResponse: ApiAuthResponse) => {
    setAccessToken(authResponse.accessToken)
    if (
      authResponse.refreshTokenResponseType === 'body' &&
      getConfig().auth.refreshTokenImplementation === 'authorizationHeader'
    ) {
      storeRefreshToken(authResponse.refreshToken)
    }
    const authViewerUuid = getAccessTokenPermissions()?.viewerUuid
    if (authViewerUuid) {
      setViewerUuid(authViewerUuid)
    }
    setPermissionsView('protected')
    setAuthError(null)
    setShouldPromptAuth(false)
  }
  const handleGoToAuthPrompt = async () => {
    // Capture viewerUuid before discarding access token
    const authViewerUuid = getAccessTokenPermissions()?.viewerUuid
    setAccessToken(null)
    clearRefreshToken()
    if (authViewerUuid) {
      try {
        const result = await validateUuidMutation.mutateAsync({
          viewerUuid: authViewerUuid,
        })
        setViewerUuid(authViewerUuid)
        setShouldPromptAuth(result)
      } catch (err) {
        setShouldPromptAuth(false)
      }
    }

    setShouldPromptAuth(true)
  }

  const authRefresh = async () => {
    setAuthRefreshLoading(true)
    try {
      const refreshTokenResponse = await refreshTokenMutation.mutateAsync({
        responseOptions: {
          shouldIncludeViewerWebAppSettings: true,
        },
      })
      handleAuthSuccess(refreshTokenResponse)
    } catch (err) {
      if ((err as any as ApiError | null)?.data?.code === 'UNAUTHORIZED') {
        handleGoToAuthPrompt()
      } else {
        throw err
      }
    } finally {
      setAuthRefreshLoading(false)
    }
  }
  useEffect(() => {
    if (permissionsViewFromSettings === 'protected' && !!viewerUuidFromSettings && !isLoggedIn()) {
      authRefresh()
    }
  }, [])
  const signIn = (viewerUuid: string, password: string) =>
    authenticateMutation
      .mutateAsync({
        viewerUuid,
        password,
        responseOptions: {
          shouldIncludeViewerWebAppSettings: true,
        },
      })
      .then((data) => {
        handleAuthSuccess(data)
        return data
      })
      .catch((err) => {
        if (err?.message) {
          setAuthError(err.message)
        }
      })
  const clearAuthError = () => setAuthError(null)
  return {
    authError,
    clearAuthError,
    isAuthFormLoading: authenticateMutation.isLoading,
    isAuthRefreshLoading,
    shouldPromptAuth,
    signIn,
  }
}

const AuthContext = createContext<ReturnType<typeof useAuth>>(null as any)

export const useAuthContext = () => useContext(AuthContext)

type Props = {
  children?: React.ReactNode
}

export const AuthProvider = ({ children }: Props) => {
  const ctxValue = useAuth()
  return <AuthContext.Provider value={ctxValue}>{children}</AuthContext.Provider>
}
