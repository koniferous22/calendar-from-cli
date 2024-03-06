import { queries } from '@calendar-from-cli/db-queries'
import { calendarProcess, jobs } from '@calendar-from-cli/backend-lib'
import { getConfigurables } from '../config/configurables.js'
import { router } from '../trpc/router.js'
import { publicProcedure } from '../trpc/procedures.js'
import { TRPCError } from '@trpc/server'

const processUpdateProcedure = publicProcedure.use(async (opts) => {
  if (opts.ctx.config.jobs.calendarCleanup.enabledMiddlewareTriggers.processRouter.processUpdateProcedure) {
    await jobs.calendarCleanup()
  }
  return opts.next({
    ctx: {},
  })
})

export const processRouter = router({
  listUpcoming: publicProcedure.query(async (opts) => {
    return queries.listUpcomingProcesses()
  }),
  cancelUpcoming: processUpdateProcedure
    .input(getConfigurables().validators.apiInput.process.zCancelProcessInput)
    .mutation(async (opts) => {
      const scheduledProcess = await queries.findProcessById(opts.input.id)
      const now = new Date()
      if (!scheduledProcess) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Process not found',
        })
      }
      if (scheduledProcess.StartsAtUTC < now) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot cancel process that has already started',
        })
      }
      if (scheduledProcess.ProcessState !== 'Active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot cancel inactive process',
        })
      }
      return calendarProcess.syncProcessUpdates(calendarProcess.resolveCancelProcessUpdates(scheduledProcess))
    }),
  cancelItem: processUpdateProcedure
    .input(getConfigurables().validators.apiInput.process.zCancelProcessItemInput)
    .mutation(async (opts) => {
      const processItemAttachment = await queries.findProcessItemAttachmentById(opts.input.itemAttachmentId)
      if (!processItemAttachment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Process item attachment not found',
        })
      }
      const scheduledProcess = await queries.findProcessById(processItemAttachment.ProcessId)
      if (!scheduledProcess) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Process not found',
        })
      }
      return calendarProcess.syncProcessUpdates(
        calendarProcess.resolveCancelProcessItemUpdates(
          scheduledProcess,
          processItemAttachment.Index,
          opts.input.subsequentProcessItemsBehaviour,
          opts.ctx.config.timezone,
        ),
      )
    }),
  rescheduleUpcoming: processUpdateProcedure
    .input(getConfigurables().validators.apiInput.process.zRescheduleProcessInput)
    .mutation(async (opts) => {
      const scheduledProcess = await queries.findProcessById(opts.input.id)
      const now = new Date()
      if (!scheduledProcess) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Process not found',
        })
      }
      if (scheduledProcess.StartsAtUTC < now) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot reschedule process that has already started',
        })
      }
      if (scheduledProcess.ProcessState !== 'Active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot reschedule inactive process',
        })
      }
      return calendarProcess.syncProcessUpdates(
        calendarProcess.resolveRescheduleProcessUpdates(
          scheduledProcess,
          opts.input.scheduleBaselineUTC,
          opts.ctx.config.timezone,
        ),
      )
    }),
  rescheduleItem: processUpdateProcedure
    .input(getConfigurables().validators.apiInput.process.zRescheduleProcessItemInput)
    .mutation(async (opts) => {
      const processItemAttachment = await queries.findProcessItemAttachmentById(opts.input.itemAttachmentId)
      if (!processItemAttachment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Process item attachment not found',
        })
      }
      const scheduledProcess = await queries.findProcessById(processItemAttachment.ProcessId)
      if (!scheduledProcess) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Process not found',
        })
      }
      return calendarProcess.syncProcessUpdates(
        calendarProcess.resolveRescheduleProcessItemUpdates(
          scheduledProcess,
          processItemAttachment.Index,
          opts.input.scheduledAtUTC,
          opts.input.duration,
          opts.input.subsequentProcessItemsBehaviour,
          opts.ctx.config.timezone,
        ),
      )
    }),
})
