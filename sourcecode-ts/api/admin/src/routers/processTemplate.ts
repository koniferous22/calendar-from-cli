import { queries } from '@calendar-from-cli/db-queries'
import { prisma } from '@calendar-from-cli/prisma'
import { calendarProcess, jobs } from '@calendar-from-cli/backend-lib'
import { getConfigurables } from '../config/configurables.js'
import { router } from '../trpc/router.js'
import { publicProcedure } from '../trpc/procedures.js'
import { TRPCError } from '@trpc/server'

const processTemplateUpdateProcedure = publicProcedure.use(async (opts) => {
  if (
    opts.ctx.config.jobs.calendarCleanup.enabledMiddlewareTriggers.processTemplateRouter.processTemplateUpdateProcedure
  ) {
    await jobs.calendarCleanup()
  }
  return opts.next({
    ctx: {},
  })
})

const processTemplateScheduleProcedure = publicProcedure.use(async (opts) => {
  if (
    opts.ctx.config.jobs.calendarCleanup.enabledMiddlewareTriggers.processTemplateRouter
      .processTemplateScheduleProcedure
  ) {
    await jobs.calendarCleanup()
  }
  return opts.next({
    ctx: {},
  })
})

export const processTemplateRouter = router({
  list: publicProcedure.query(() => {
    return queries.listAllProcessTemplates()
  }),
  upsert: processTemplateUpdateProcedure
    .input(getConfigurables().validators.apiInput.processTemplate.zUpsertProcessTemplateInput)
    .mutation(async (opts) => {
      let eventTag = null as null | Awaited<ReturnType<typeof queries.findEventTagByAlias>>
      if (!!opts.input.fields.tagAlias) {
        eventTag = await queries.findEventTagByAlias(opts.input.fields.tagAlias)
      }
      return prisma.$transaction(async (tx) => {
        const eventTemplates = await queries.transactional.findEventTemplatesByAliases(
          tx,
          opts.input.attachments.map(({ eventTemplateAlias }) => eventTemplateAlias),
        )
        const processTemplateItems = opts.input.attachments.map(
          ({ eventTemplateAlias, processItemOffset }, arrayIndex) => ({
            Index: arrayIndex,
            EventTemplateId: eventTemplates[eventTemplateAlias].Id,
            ItemOffset: processItemOffset as any,
          }),
        )
        return queries.transactional.upsertProcessTemplate(
          tx,
          opts.input.fields.alias,
          {
            TransparencyScope: opts.input.fields.transparencyScope,
            Title: opts.input.fields.title,
            Description: opts.input.fields.description,
            DescriptionFormat: opts.input.fields.descriptionFormat,
            ProtectedTitle: opts.input.fields.protectedTitle ?? null,
            ProtectedDescription: opts.input.fields.protectedDescription ?? null,
            ProtectedDescriptionFormat: opts.input.fields.protectedDescriptionFormat ?? null,
            PublicTitle: opts.input.fields.publicTitle ?? null,
            PublicDescription: opts.input.fields.publicDescription ?? null,
            PublicDescriptionFormat: opts.input.fields.publicDescriptionFormat ?? null,
            EventTagId: eventTag?.Id ?? null,
            ProcessColor: opts.input.fields.processColor ?? null,
          },
          processTemplateItems,
        )
      })
    }),
  remove: processTemplateUpdateProcedure
    .input(getConfigurables().validators.apiInput.processTemplate.zRemoveProcessTemplateInput)
    .mutation(async (opts) => {
      return prisma.$transaction((tx) => {
        return queries.transactional.removeProcessTemplateOrThrow(tx, opts.input.alias)
      })
    }),
  scheduleProcess: processTemplateScheduleProcedure
    .input(getConfigurables().validators.apiInput.processTemplate.zScheduleProcessFromProcessTemplateInput)
    .mutation(async (opts) => {
      const processTemplate = await queries.findProcessTemplateByAlias(opts.input.alias)
      if (!processTemplate) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Process template not found',
        })
      }
      const now = new Date()
      return prisma.$transaction(async (tx) => {
        const process = await queries.transactional.scheduleProcessFromProcessTemplate(
          tx,
          processTemplate,
          opts.ctx.config.dbContentDefaults.scheduleProcess,
          opts.input.scheduleBaselineUTC,
          now,
        )
        return calendarProcess.scheduleProcessItemAttachmentsFromProcessTemplateItems(
          tx,
          process.Id,
          processTemplate,
          opts.ctx.config.dbContentDefaults.scheduleEvent,
          opts.input.scheduleBaselineUTC,
          opts.ctx.config.timezone,
          now,
        )
      })
    }),
})
