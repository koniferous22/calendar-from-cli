import { z } from 'zod'

export const zTrustedViewerCalendarPermissions = z.object({
  canSeeTags: z.boolean(),
  canSeeProcessAssociations: z.boolean(),
  canViewPast: z.boolean(),
  canSwitchToPublicView: z.boolean(),
})

export const zTrustedViewerEventTagPermissionsType = z.union([z.literal('allowList'), z.literal('denyList')] as const)

export const zEventTagAccess = z.union([z.literal('Allow'), z.literal('Deny')])

export const zTrustedViewerUuid = z.string().uuid()
