import { queries } from '@calendar-from-cli/db-queries'
import { types } from '@calendar-from-cli/validation-lib'
import { validateTrustedViewerAccess } from '../trusted-viewer/access.js'
import { signJwtToken } from './jwt.js'
import { retrieveRefreshToken } from './refreshToken.js'

export const findAndValidateTrustedViewer = (viewerUuid: string) =>
  queries.findTrustedViewerByViewerUuidOrThrow(viewerUuid).then(validateTrustedViewerAccess)

type TrustedViewer = Awaited<ReturnType<typeof findAndValidateTrustedViewer>>

const createAccessTokenPayload = (trustedViewer: TrustedViewer): types.AccessTokenPayload => ({
  viewerUuid: trustedViewer.ViewerUuid,
  alias: trustedViewer.Alias,
  calendarPermissions: {
    canSeeTags: trustedViewer.TrustedViewerCalendarPermissions.CanSeeTags,
    canSeeProcessAssociations: trustedViewer.TrustedViewerCalendarPermissions.CanSeeProcessAssociations,
    canSwitchToPublicView: trustedViewer.TrustedViewerCalendarPermissions.CanSwitchToPublicView,
    canViewPast: trustedViewer.TrustedViewerCalendarPermissions.CanViewPast,
  },
  eventTagPermissionsType: trustedViewer.DefaultEventTagAccess === 'Allow' ? 'denyList' : 'allowList',
  eventTagPermissions: trustedViewer.TrustedViewerEventTagPermission.map(({ EventTagAccess, EventTag }) => ({
    eventTagAlias: EventTag.Alias,
    eventTagAccess: EventTagAccess,
  })),
})

const createRefreshTokenPayload = (viewerUuid: string, refreshToken: string) => ({
  viewerUuid,
  refreshToken,
})

type CreateAuthResponseOpts = {
  jwtSecret: string
  accessToken: {
    expirationPeriodSeconds: number
  }
  refreshToken: {
    expirationPeriodSeconds: number
    opts: {
      randomBytesLength: number
      bcryptSaltRounds: number
    }
  }
}

export const createAuthResponse = async (
  trustedViewer: TrustedViewer,
  { jwtSecret, accessToken, refreshToken }: CreateAuthResponseOpts,
) => {
  const signedAccessToken = signJwtToken(
    createAccessTokenPayload(trustedViewer),
    jwtSecret,
    accessToken.expirationPeriodSeconds,
  )
  const refreshTokenString = await retrieveRefreshToken(
    trustedViewer.ViewerUuid,
    refreshToken.opts.randomBytesLength,
    refreshToken.opts.bcryptSaltRounds,
  )
  const signedRefreshToken = signJwtToken(
    createRefreshTokenPayload(trustedViewer.ViewerUuid, refreshTokenString),
    jwtSecret,
    refreshToken.expirationPeriodSeconds,
  )
  return {
    accessToken: signedAccessToken,
    refreshToken: signedRefreshToken,
  }
}
