import { queries } from '@calendar-from-cli/db-queries'
import { getConfigurables } from '../config/configurables.js'
import { router } from '../trpc/router.js'
import { publicProcedure } from '../trpc/procedures.js'
import { jobs } from '@calendar-from-cli/backend-lib'

const eventTagUpdateProcedure = publicProcedure.use(async (opts) => {
  if (opts.ctx.config.jobs.calendarCleanup.enabledMiddlewareTriggers.eventTagRouter.eventTagUpdateProcedure) {
    await jobs.calendarCleanup()
  }
  return opts.next({
    ctx: {},
  })
})

export const eventTagRouter = router({
  list: publicProcedure.query(() => {
    return queries.listAllEventTags()
  }),
  upsert: eventTagUpdateProcedure
    .input(getConfigurables().validators.apiInput.eventTag.zUpsertEventTagInput)
    .mutation(async (opts) => {
      return queries.upsertEventTag(opts.input.alias, {
        Color: opts.input.color,
      })
    }),
  remove: eventTagUpdateProcedure
    .input(getConfigurables().validators.apiInput.eventTag.zRemoveEventTagInput)
    .mutation(async (opts) => {
      return queries.removeEventTag(opts.input.alias)
    }),
})
