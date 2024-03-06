import { calendar, jobs } from '@calendar-from-cli/backend-lib'

import { queries } from '@calendar-from-cli/db-queries'
import { getConfigurables } from '../config/configurables.js'
import { accessTokenProcedure, publicProcedure } from '../trpc/procedures.js'
import { router } from '../trpc/router.js'

const publicCalendarListProcedure = publicProcedure.use(async (opts) => {
  if (opts.ctx.config.jobs.migratePast.enabledMiddlewareTriggers.calendarRouter.publicCalendarListProcedure) {
    await jobs.migratePast(opts.ctx.config.jobs.migratePast.jobSettings)
  }
  // At least one calendar version is ensured by "initialize" backend-lib jobs
  const calendarViewVersion = (await queries.getLatestCalendarViewVersion())!.Id
  return opts.next({
    ctx: {
      calendarViewVersion,
    },
  })
})

const calendarListProcedure = accessTokenProcedure.use(async (opts) => {
  if (opts.ctx.config.jobs.migratePast.enabledMiddlewareTriggers.calendarRouter.calendarListProcedure) {
    await jobs.migratePast(opts.ctx.config.jobs.migratePast.jobSettings)
  }
  // At least one calendar version is ensured by "initialize" backend-li jobs
  const calendarViewVersion = (await queries.getLatestCalendarViewVersion())!.Id
  return opts.next({
    ctx: {
      calendarViewVersion,
    },
  })
})

export const calendarRouter = router({
  latestViewVersion: publicCalendarListProcedure.query((opts) => {
    return opts.ctx.calendarViewVersion
  }),
  listPublicDayView: publicCalendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListEventsInDay)
    .query((opts) => {
      const { year, month, dayOfMonth, clientTimezone } = opts.input
      return calendar.listCalendarDayView(year, month, dayOfMonth, clientTimezone, opts.ctx.calendarViewVersion, null)
    }),
  listPublicWeekView: publicCalendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListEventsInWeek)
    .query((opts) => {
      const { year, month, dayOfMonth, clientTimezone } = opts.input
      return calendar.listCalendarWeekView(year, month, dayOfMonth, clientTimezone, opts.ctx.calendarViewVersion, null)
    }),
  listPublicMonthView: publicCalendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListEventsInMonth)
    .query((opts) => {
      const { year, month, clientTimezone } = opts.input
      return calendar.listCalendarMonthView(year, month, clientTimezone, opts.ctx.calendarViewVersion, null)
    }),
  listDayView: calendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListEventsInDay)
    .query((opts) => {
      const { year, month, dayOfMonth, clientTimezone } = opts.input
      return calendar.listCalendarDayView(
        year,
        month,
        dayOfMonth,
        clientTimezone,
        opts.ctx.calendarViewVersion,
        opts.ctx.accessTokenPayload,
      )
    }),
  listWeekView: calendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListEventsInWeek)
    .query((opts) => {
      const { year, month, dayOfMonth, clientTimezone } = opts.input
      return calendar.listCalendarWeekView(
        year,
        month,
        dayOfMonth,
        clientTimezone,
        opts.ctx.calendarViewVersion,
        opts.ctx.accessTokenPayload,
      )
    }),
  listMonthView: calendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListEventsInMonth)
    .query((opts) => {
      const { year, month, clientTimezone } = opts.input
      return calendar.listCalendarMonthView(
        year,
        month,
        clientTimezone,
        opts.ctx.calendarViewVersion,
        opts.ctx.accessTokenPayload,
      )
    }),
})
