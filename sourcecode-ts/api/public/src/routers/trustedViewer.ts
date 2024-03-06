import { TRPCError } from '@trpc/server'
import { authUtils } from '@calendar-from-cli/backend-lib'
import { getConfigurables } from '../config/configurables.js'
import { publicProcedure, refreshTokenProcedure } from '../trpc/procedures.js'
import { router } from '../trpc/router.js'
import cookie from 'cookie'

export const trustedViewerRouter = router({
  validate: publicProcedure
    .input(getConfigurables().validators.apiInput.trustedViewer.zValidateTrustedViewerAccessInput)
    .mutation(async (opts) => {
      await authUtils.findAndValidateTrustedViewer(opts.input.viewerUuid)
      return true
    }),
  // Note - Auth entrypoint #2
  authenticate: publicProcedure
    .input(getConfigurables().validators.apiInput.trustedViewer.zAuthenticateTrustedViewerAccessInput)
    .mutation(async (opts) => {
      const trustedViewerRecord = await authUtils.findAndValidateTrustedViewer(opts.input.viewerUuid)
      const isPasswordMatching = await authUtils.bcryptCompare(opts.input.password, trustedViewerRecord.PasswordHash)
      if (!isPasswordMatching) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Incorrect password',
        })
      }
      const authResponse = await authUtils.createAuthResponse(trustedViewerRecord, {
        jwtSecret: opts.ctx.secretReaders.getJwtSecret(),
        refreshToken: opts.ctx.config.auth.refreshToken,
        accessToken: opts.ctx.config.auth.accessToken,
      })
      const additionalAuthResponseFields = authUtils.resolveAuthResponseOptions(
        opts.input.responseOptions,
        trustedViewerRecord,
      )
      switch (opts.ctx.config.auth.refreshToken.implementation.type) {
        case 'authorizationHeader':
          return {
            refreshTokenResponseType: 'body' as const,
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
            ...additionalAuthResponseFields,
          }
        case 'cookieHeader':
          const { cookieKey, cookieAttributes } = opts.ctx.config.auth.refreshToken.implementation
          opts.ctx.setResponseHeader(
            'Set-Cookie',
            cookie.serialize(cookieKey, authResponse.refreshToken, cookieAttributes),
          )
          return {
            refreshTokenResponseType: 'setCookie' as const,
            accessToken: authResponse.accessToken,
            ...additionalAuthResponseFields,
          }
      }
    }),
  // Note - Auth entrypoint #3
  refreshToken: refreshTokenProcedure
    .input(getConfigurables().validators.apiInput.trustedViewer.zRefreshTrustedViewerTokenInput)
    .mutation(async (opts) => {
      const viewerUuid = opts.ctx.refreshTokenPayload.viewerUuid
      const trustedViewerRecord = await authUtils.findAndValidateTrustedViewer(viewerUuid)
      const authResponse = await authUtils.createAuthResponse(trustedViewerRecord, {
        jwtSecret: opts.ctx.secretReaders.getJwtSecret(),
        refreshToken: opts.ctx.config.auth.refreshToken,
        accessToken: opts.ctx.config.auth.accessToken,
      })
      const additionalAuthResponseFields = authUtils.resolveAuthResponseOptions(
        opts.input.responseOptions,
        trustedViewerRecord,
      )
      switch (opts.ctx.config.auth.refreshToken.implementation.type) {
        case 'authorizationHeader':
          return {
            refreshTokenResponseType: 'body' as const,
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
            ...additionalAuthResponseFields,
          }
        case 'cookieHeader':
          const { cookieKey, cookieAttributes } = opts.ctx.config.auth.refreshToken.implementation
          opts.ctx.setResponseHeader(
            'Set-Cookie',
            cookie.serialize(cookieKey, authResponse.refreshToken, cookieAttributes),
          )
          return {
            refreshTokenResponseType: 'setCookie' as const,
            accessToken: authResponse.accessToken,
            ...additionalAuthResponseFields,
          }
      }
    }),
})
