import { queries, types } from '@calendar-from-cli/db-queries'
import { authUtils, jobs } from '@calendar-from-cli/backend-lib'
import { getConfigurables } from '../config/configurables.js'
import { publicProcedure } from '../trpc/procedures.js'
import { router } from '../trpc/router.js'
import { getConfig } from '../config/config.js'
import { TRPCError } from '@trpc/server'

const trustedViewerUpdateProcedure = publicProcedure.use(async (opts) => {
  if (opts.ctx.config.jobs.calendarCleanup.enabledMiddlewareTriggers.trustedViewerRouter.trustedViewerUpdateProcedure) {
    await jobs.calendarCleanup()
  }
  return opts.next({
    ctx: {},
  })
})

export const trustedViewerRouter = router({
  listActive: publicProcedure.query(async (opts) => {
    return queries.listActiveTrustedViewers()
  }),
  createAccess: trustedViewerUpdateProcedure
    .input(getConfigurables().validators.apiInput.trustedViewer.zCreateTrustedViewerAccessInput)
    .mutation(async (opts) => {
      const { foundEventTags, notFoundAliases } = await queries.listEventTagsByAliases(opts.input.eventTags)
      if (notFoundAliases.length > 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Following aliases not found: ${notFoundAliases.map((alias) => `"${alias}"`).join(', ')}`,
        })
      }
      let defaultEventTagAccess: types.CreateTrustedViewerInput['eventTagRelations']['defaultEventTagAccess']
      let eventTagAccess: types.CreateTrustedViewerInput['eventTagRelations']['eventTagAccess']
      switch (opts.input.eventTagPermissionsType) {
        case 'allowList':
          defaultEventTagAccess = 'Deny'
          eventTagAccess = foundEventTags.map((eventTag) => ({
            eventTag,
            eventTagAccess: 'Allow',
          }))
          break
        case 'denyList':
          defaultEventTagAccess = 'Allow'
          eventTagAccess = foundEventTags.map((eventTag) => ({
            eventTag,
            eventTagAccess: 'Deny',
          }))
          break
        default:
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Invalid event tag permissions type ${opts.input.eventTagPermissionsType}`,
          })
      }
      const passwordHash = await authUtils.bcryptHash(opts.input.password, getConfig().bcryptjs.saltRounds)
      const trustedViewerRecord = await queries.createTrustedViewerAccess({
        fields: {
          Alias: opts.input.alias,
          GrantExpiresAt: opts.input.grantExpiresAt ?? null,
        },
        passwordHash,
        calendarPermissions: {
          CanSeeProcessAssociations: opts.input.calendarPermissions.canSeeProcessAssociations,
          CanSeeTags: opts.input.calendarPermissions.canSeeTags,
          CanSwitchToPublicView: opts.input.calendarPermissions.canSwitchToPublicView,
          CanViewPast: opts.input.calendarPermissions.canViewPast,
        },
        eventTagRelations: {
          defaultEventTagAccess,
          eventTagAccess,
        },
        webAppSettings: opts.input.webAppSettings ?? null,
      })
      return {
        viewerUuid: trustedViewerRecord.ViewerUuid,
      }
    }),
  revokeAccess: trustedViewerUpdateProcedure
    .input(getConfigurables().validators.apiInput.trustedViewer.zRevokeTrustedViewerAccessInput)
    .mutation(async (opts) => {
      const trustedViewer = await queries.revokeTrustedViewerAccess(opts.input.viewerUuid)
      return {
        viewerUuid: trustedViewer.ViewerUuid,
      }
    }),
})
