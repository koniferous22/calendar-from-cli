import { inferRouterError } from '@trpc/server'
import { httpBatchLink, httpLink, splitLink, createTRPCProxyClient } from '@trpc/client'
import type { AppRouter } from '../../../api/public/src/index.js'
import { getConfig } from '../config/config.js'
import { retrieveRefreshToken } from '../browser-api/localStorage.js'
import { getToken } from './auth.js'

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.path === 'trustedViewer.refreshToken',
      true: httpLink({
        url: getConfig().publicApi,
        headers() {
          const refreshToken = retrieveRefreshToken()
          return getConfig().auth.refreshTokenImplementation === 'authorizationHeader' && refreshToken
            ? {
                authorization: `Bearer ${refreshToken}`,
              }
            : {}
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          })
        },
      }),

      false: httpBatchLink({
        url: getConfig().publicApi,
        headers() {
          const accessToken = getToken()
          return accessToken
            ? {
                authorization: `Bearer ${accessToken}`,
              }
            : {}
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          })
        },
      }),
    }),
  ],
})

export type ApiError = inferRouterError<AppRouter>
