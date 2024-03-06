import { queries } from '@calendar-from-cli/db-queries'
import { getRecurringEventBaselineUTCSchedule } from '@calendar-from-cli/calendar-utils'
import { getConfigurables } from '../config/configurables.js'
import { router } from '../trpc/router.js'
import { publicProcedure } from '../trpc/procedures.js'
import { jobs } from '@calendar-from-cli/backend-lib'
import { TRPCError } from '@trpc/server'

const eventTemplateUpdateProcedure = publicProcedure.use(async (opts) => {
  if (opts.ctx.config.jobs.calendarCleanup.enabledMiddlewareTriggers.eventTemplateRouter.eventTemplateUpdateProcedure) {
    await jobs.calendarCleanup()
  }
  return opts.next({
    ctx: {},
  })
})

const eventTemplateScheduleProcedure = publicProcedure.use(async (opts) => {
  if (
    opts.ctx.config.jobs.calendarCleanup.enabledMiddlewareTriggers.eventTemplateRouter.eventTemplateScheduleProcedure
  ) {
    await jobs.calendarCleanup()
  }
  return opts.next({
    ctx: {},
  })
})

export const eventTemplateRouter = router({
  list: publicProcedure.query(() => {
    return queries.listAllEventTemplates()
  }),
  upsert: eventTemplateUpdateProcedure
    .input(getConfigurables().validators.apiInput.eventTemplate.zUpsertEventTemplateInput)
    .mutation(async (opts) => {
      let eventTag = null as null | Awaited<ReturnType<typeof queries.findEventTagByAlias>>
      if (!!opts.input.tagAlias) {
        eventTag = await queries.findEventTagByAlias(opts.input.tagAlias)
      }
      return queries.upsertEventTemplate(
        opts.input.alias,
        {
          TransparencyScope: opts.input.transparencyScope,
          Title: opts.input.title,
          Description: opts.input.description,
          DescriptionFormat: opts.input.descriptionFormat,
          ProtectedTitle: opts.input.protectedTitle ?? null,
          ProtectedDescription: opts.input.protectedDescription ?? null,
          ProtectedDescriptionFormat: opts.input.protectedDescriptionFormat ?? null,
          PublicTitle: opts.input.publicTitle ?? null,
          PublicDescription: opts.input.publicDescription ?? null,
          PublicDescriptionFormat: opts.input.publicDescriptionFormat ?? null,
          EventTagId: eventTag?.Id ?? null,
          Duration: opts.input.duration,
          Notifications: [],
        },
        opts.input.metadata,
      )
    }),
  remove: eventTemplateUpdateProcedure
    .input(getConfigurables().validators.apiInput.eventTemplate.zRemoveEventTemplateInput)
    .mutation(async (opts) => {
      return queries.removeEventTag(opts.input.alias)
    }),
  scheduleEvent: eventTemplateScheduleProcedure
    .input(getConfigurables().validators.apiInput.eventTemplate.zScheduleEventInput)
    .mutation(async (opts) => {
      const eventTemplate = await queries.findEventTemplateByAlias(opts.input.alias)
      if (!eventTemplate) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event template not found',
        })
      }
      return queries.scheduleEventFromEventTemplate(
        eventTemplate,
        opts.ctx.config.dbContentDefaults.scheduleEvent,
        opts.input.scheduledAtUTC,
      )
    }),
  scheduleRecurringEvent: eventTemplateScheduleProcedure
    .input(getConfigurables().validators.apiInput.eventTemplate.zScheduleRecurringEventInput)
    .mutation(async (opts) => {
      const startSince = opts.input.startInstancesSince ?? new Date()
      const recurringEventObjectLimit =
        opts.ctx.config.inputValidation.objectCountLimits.recurringEvent.maxRecurringEvents
      const allRecurringEvents = await queries.listAllActiveRecurringEvents()
      if (allRecurringEvents.length >= recurringEventObjectLimit) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Exceeded limit of active recurring events',
        })
      }
      const eventTemplate = await queries.findEventTemplateByAlias(opts.input.alias)
      if (!eventTemplate) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event template not found',
        })
      }
      const baselineSchedule = getRecurringEventBaselineUTCSchedule(
        startSince,
        opts.ctx.config.timezone,
        opts.input.recurringEventSchedule,
      )
      return queries.scheduleRecurringEventFromEventTemplate(
        eventTemplate,
        opts.ctx.config.dbContentDefaults.scheduleRecurringEvent,
        baselineSchedule,
        opts.input.recurringEventSchedule,
      )
    }),
})
