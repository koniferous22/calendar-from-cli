import { queries } from '@calendar-from-cli/db-queries'
import { jobs, recurringEvents } from '@calendar-from-cli/backend-lib'
import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'
import { getRecurringEventBaselineUTCSchedule } from '@calendar-from-cli/calendar-utils'
import { getConfigurables } from '../config/configurables.js'
import { getConfig } from '../config/config.js'
import { router } from '../trpc/router.js'
import { publicProcedure } from '../trpc/procedures.js'
import { TRPCError } from '@trpc/server'

const { automaticUpdateForUnaffected } = getConfig().recurringEventsSync

const recurringEventUpdateProcedure = publicProcedure.use(async (opts) => {
  if (
    opts.ctx.config.jobs.calendarCleanup.enabledMiddlewareTriggers.recurringEventRouter.recurringEventUpdateProcedure
  ) {
    await jobs.calendarCleanup()
  }
  return opts.next({
    ctx: {},
  })
})

export const recurringEventRouter = router({
  listActive: publicProcedure.query(() => {
    return queries.listAllActiveRecurringEvents()
  }),
  cancel: recurringEventUpdateProcedure
    .input(getConfigurables().validators.apiInput.recurringEvent.zCancelRecurringEventInput)
    .mutation(async (opts) => {
      const recurringEvent = await queries.findRecurringEventById(opts.input.id)
      if (!recurringEvent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring event not found',
        })
      }
      const calendarViewVersion = await queries.getLatestCalendarViewVersion()
      return recurringEvents.syncRecurringEvents(
        calendarViewVersion!.Id,
        recurringEvent,
        async (pc: PrismaClientReusableInTransactions) => {
          return queries.transactional.cancelRecurringEvent(pc, recurringEvent.Id)
        },
        {
          automaticUpdateForUnaffected,
          shouldCancelConvertedOrphans: opts.input.shouldCancelConvertedEvents,
        },
      )
    }),
  updateSchedule: recurringEventUpdateProcedure
    .input(getConfigurables().validators.apiInput.recurringEvent.zUpdateRecurringEventScheduleInput)
    .mutation(async (opts) => {
      const recurringEvent = await queries.findRecurringEventById(opts.input.id)
      if (!recurringEvent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring event not found',
        })
      }
      const startSince = opts.input.startSinceOverride ?? new Date()
      const duration = opts.input.durationOverride ?? recurringEvent.Duration
      const calendarViewVersion = await queries.getLatestCalendarViewVersion()
      const baselineSchedule = getRecurringEventBaselineUTCSchedule(
        startSince,
        opts.ctx.config.timezone,
        opts.input.recurringEventSchedule,
      )
      return recurringEvents.syncRecurringEvents(
        calendarViewVersion!.Id,
        recurringEvent,
        async (pc: PrismaClientReusableInTransactions) => {
          return queries.transactional.updateRecurringEventSchedule(
            pc,
            recurringEvent.Id,
            opts.input.recurringEventSchedule,
            duration,
            baselineSchedule,
          )
        },
        {
          automaticUpdateForUnaffected,
          shouldCancelConvertedOrphans: opts.input.shouldCancelConvertedEvents,
        },
      )
    }),
  cancelInstance: recurringEventUpdateProcedure
    .input(getConfigurables().validators.apiInput.recurringEvent.zCancelRecurringEventInstanceInput)
    .mutation(async (opts) => {
      const recurringEventInstance = await queries.findRecurringEventInstanceById(opts.input.instanceId)
      if (!recurringEventInstance) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring event instance not found',
        })
      }
      if (recurringEventInstance.RecurringEventInstanceConversionId !== null) {
        // Already converted
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Recurring event instance already modified - treated as standalone event',
        })
      }
      const calendarViewVersion = await queries.getLatestCalendarViewVersion()
      return recurringEvents.syncRecurringEventsWithInstances(
        calendarViewVersion!.Id,
        recurringEventInstance,
        async (pc) => {
          return queries.transactional.convertRecurringEventInstanceToEvent(pc, recurringEventInstance, {
            type: 'cancel',
            eventState: 'Cancelled',
          })
        },
        {
          automaticUpdateForUnaffected,
        },
      )
    }),
  rescheduleInstance: recurringEventUpdateProcedure
    .input(getConfigurables().validators.apiInput.recurringEvent.zRescheduleRecurringEventInstanceInput)
    .mutation(async (opts) => {
      const recurringEventInstance = await queries.findRecurringEventInstanceById(opts.input.instanceId)
      if (!recurringEventInstance) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring event instance not found',
        })
      }
      if (recurringEventInstance.RecurringEventInstanceConversionId !== null) {
        // Already converted
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Recurring event instance already modified - treated as standalone event',
        })
      }
      const scheduledAtUTC = opts.input.scheduledAtUTCOverride ?? recurringEventInstance.ScheduledAtUTC
      const duration = opts.input.durationOverride ?? recurringEventInstance.RecurringEvent.Duration
      const calendarViewVersion = await queries.getLatestCalendarViewVersion()
      return recurringEvents.syncRecurringEventsWithInstances(
        calendarViewVersion!.Id,
        recurringEventInstance,
        async (pc) => {
          return queries.transactional.convertRecurringEventInstanceToEvent(pc, recurringEventInstance, {
            type: 'reschedule',
            eventState: 'Active',
            scheduledAtUTC,
            duration,
          })
        },
        {
          automaticUpdateForUnaffected,
        },
      )
    }),
})
