import { z } from 'zod'
import { zTrustedViewerUuid } from '../../../primitives/trustedViewer.js'
import { UniversalConfig } from '../../../config/universal.js'

const zRefreshToken = z.string()

export const createZRefreshTokenPayload = (_: UniversalConfig) =>
  z.object({
    data: z.object({
      viewerUuid: zTrustedViewerUuid,
      refreshToken: zRefreshToken,
    }),
  })
