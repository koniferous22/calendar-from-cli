import { z } from 'zod'
import { createZLimitedString } from '../../../primitives/configurable/string.js'
import {
  zEventTagAccess,
  zTrustedViewerCalendarPermissions,
  zTrustedViewerEventTagPermissionsType,
  zTrustedViewerUuid,
} from '../../../primitives/trustedViewer.js'
import { UniversalConfig } from '../../../config/universal.js'

export const createZAccessTokenPayload = ({ inputValidation }: UniversalConfig) =>
  z.object({
    data: z.object({
      viewerUuid: zTrustedViewerUuid,
      alias: createZLimitedString(inputValidation.stringLimits.trustedViewer.maxTrustedViewerAliasLength),
      calendarPermissions: zTrustedViewerCalendarPermissions,
      eventTagPermissionsType: zTrustedViewerEventTagPermissionsType,
      eventTagPermissions: z.array(
        z.object({
          eventTagAccess: zEventTagAccess,
          eventTagAlias: createZLimitedString(inputValidation.stringLimits.eventTag.maxEventTagAliasLength),
        }),
      ),
    }),
  })
