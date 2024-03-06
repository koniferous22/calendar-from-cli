import { queries } from '@calendar-from-cli/db-queries'
import { utils } from '@calendar-from-cli/validation-lib'
import { getConfigurables } from '../config/configurables.js'
import { router } from '../trpc/router.js'
import { publicProcedure } from '../trpc/procedures.js'
import { jobs } from '@calendar-from-cli/backend-lib'
import { TRPCError } from '@trpc/server'

const { rescheduleEventDisallowedTypes, cancelEventDisallowedTypes } = getConfigurables().constants.denyLists

const eventUpdateProcedure = publicProcedure.use(async (opts) => {
  if (opts.ctx.config.jobs.calendarCleanup.enabledMiddlewareTriggers.eventRouter.eventUpdateProcedure) {
    await jobs.calendarCleanup()
  }
  return opts.next({
    ctx: {},
  })
})

export const eventRouter = router({
  cancel: eventUpdateProcedure
    .input(getConfigurables().validators.apiInput.event.zCancelEvent)
    .mutation(async (opts) => {
      const event = await queries.findEventById(opts.input.id)
      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        })
      }
      if (event.EventState !== 'Active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Event not active',
        })
      }
      utils.zDenyList(cancelEventDisallowedTypes).parse(event.EventSourceReference.EventSourceType)
      return queries.cancelEvent(event, cancelEventDisallowedTypes)
    }),
  updateSchedule: eventUpdateProcedure
    .input(getConfigurables().validators.apiInput.event.zRescheduleEvent)
    .mutation(async (opts) => {
      const event = await queries.findEventById(opts.input.id)
      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        })
      }
      if (event.EventState !== 'Active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Event not active',
        })
      }
      utils.zDenyList(rescheduleEventDisallowedTypes).parse(event.EventSourceReference.EventSourceType)
      return queries.updateEventSchedule(
        event,
        rescheduleEventDisallowedTypes,
        opts.input.scheduledAtUTC,
        opts.input.duration,
      )
    }),
  scheduleAdHoc: eventUpdateProcedure
    .input(getConfigurables().validators.apiInput.event.zScheduleAdHocEvent)
    .mutation(async (opts) => {
      let eventTag = null as null | Awaited<ReturnType<typeof queries.findEventTagByAlias>>
      if (!!opts.input.tagAlias) {
        eventTag = await queries.findEventTagByAlias(opts.input.tagAlias)
      }
      return queries.scheduleEventFromAdHocInput(
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
          ScheduledAtUTC: opts.input.scheduledAtUTC,
        },
        opts.ctx.config.dbContentDefaults.scheduleEvent,
        eventTag?.Id ?? null,
      )
    }),
})
