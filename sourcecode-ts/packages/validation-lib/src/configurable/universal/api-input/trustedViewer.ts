import { z } from 'zod'
import { createZLimitedString } from '../../../primitives/configurable/string.js'
import { createZPassword, zAuthFormInput } from '../../../primitives/configurable/password.js'
import { zFutureISODatetime } from '../../../utils/isoDatetime.js'
import {
  zTrustedViewerCalendarPermissions,
  zTrustedViewerEventTagPermissionsType,
  zTrustedViewerUuid,
} from '../../../primitives/trustedViewer.js'
import { zWebAppSettings } from '../../../primitives/webAppSettings.js'
import { UniversalConfig } from '../../../config/universal.js'
import { zAuthResponseOptions } from '../../../primitives/authResponseOptions.js'

export const createZCreateTrustedViewerAccessInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    alias: createZLimitedString(inputValidation.stringLimits.trustedViewer.maxTrustedViewerAliasLength),
    calendarPermissions: zTrustedViewerCalendarPermissions,
    eventTagPermissionsType: zTrustedViewerEventTagPermissionsType,
    eventTags: z.array(createZLimitedString(inputValidation.stringLimits.eventTag.maxEventTagAliasLength)),
    password: createZPassword(inputValidation.passwordConstraints),
    grantExpiresAt: z.optional(zFutureISODatetime),
    webAppSettings: z.optional(zWebAppSettings),
  })

export const zRevokeTrustedViewerAccessInput = z.object({
  viewerUuid: zTrustedViewerUuid,
})

export const zValidateTrustedViewerAccessInput = z.object({
  viewerUuid: zTrustedViewerUuid,
})

export const zAuthenticateTrustedViewerAccessInput = z.object({
  viewerUuid: zTrustedViewerUuid,
  password: zAuthFormInput,
  responseOptions: zAuthResponseOptions,
})

export const zRefreshTrustedViewerTokenInput = z.object({
  responseOptions: zAuthResponseOptions,
})
