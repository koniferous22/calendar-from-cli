import { configurable } from '@calendar-from-cli/validation-lib'
import { z } from 'zod'
import { getConfig } from '../config/config.js'

const decodeJwt = (token: string) => {
  const base64JwtPayload = token.split('.')[1]
  try {
    const jwtPayloadResult = atob(base64JwtPayload)
    return {
      token,
      payload: JSON.parse(jwtPayloadResult),
    }
  } catch (e) {
    if (e instanceof DOMException) {
      return null
    }
    throw e
  }
}

const zAccessToken = configurable.universalValidators.authInput.createZAccessTokenPayload(getConfig())

let accessToken = null as null | {
  token: string
  permissions: z.infer<typeof zAccessToken>['data'] | null
}

export const setAccessToken = (token: string | null) => {
  if (token) {
    const parsingResult = zAccessToken.safeParse(decodeJwt(token)?.payload)
    const permissions = parsingResult.success ? parsingResult.data.data : null
    accessToken = {
      token,
      permissions,
    }
  }
}
export const isLoggedIn = () => !!accessToken
export const getAccessTokenPermissions = () => accessToken?.permissions ?? null
export const getToken = () => accessToken?.token
