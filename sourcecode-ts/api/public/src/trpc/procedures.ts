import { t } from './trpc.js'
import { getConfigurables } from '../config/configurables.js'
import { authUtils } from '@calendar-from-cli/backend-lib'
import { TRPCError } from '@trpc/server'
import { getSecretReaders } from '../config/secrets.js'

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const publicProcedure = t.procedure

export const accessTokenProcedure = publicProcedure.use(async (opts) => {
  const { bearerToken } = opts.ctx.requestInput
  if (!bearerToken) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No token provided',
    })
  }
  const accessTokenPayload = await authUtils
    .validateJwtToken(bearerToken, getSecretReaders().getJwtSecret())
    .catch((e) => {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: e instanceof Error ? e.message : e.toString(),
      })
    })
    .then((decoded) => {
      const parseResult = getConfigurables().validators.apiAuth.zAccessTokenPayload.safeParse(decoded)
      if (!parseResult.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Received invalid token payload',
        })
      }
      return parseResult.data.data
    })
  return opts.next({
    ctx: {
      accessTokenPayload,
    },
  })
})

export const refreshTokenProcedure = publicProcedure.use(async (opts) => {
  const refreshToken = (function () {
    switch (opts.ctx.config.auth.refreshToken.implementation.type) {
      case 'authorizationHeader':
        return opts.ctx.requestInput.bearerToken
      case 'cookieHeader':
        return opts.ctx.requestInput.cookies[opts.ctx.config.auth.refreshToken.implementation.cookieKey]
    }
  })()

  if (!refreshToken) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No token provided',
    })
  }
  const refreshTokenPayload = await authUtils
    .validateJwtToken(refreshToken, getSecretReaders().getJwtSecret())
    .catch((e) => {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: e instanceof Error ? e.message : e.toString(),
      })
    })
    .then((decoded) => {
      const parseResult = getConfigurables().validators.apiAuth.zRefreshTokenPayload.safeParse(decoded)
      if (!parseResult.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Received invalid token payload',
        })
      }
      return parseResult.data.data
    })
  return opts.next({
    ctx: {
      refreshTokenPayload,
    },
  })
})
