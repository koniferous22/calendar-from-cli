import { calendar, jobs } from '@calendar-from-cli/backend-lib'

import { queries } from '@calendar-from-cli/db-queries'
import { getConfigurables } from '../config/configurables.js'
import { publicProcedure } from '../trpc/procedures.js'
import { router } from '../trpc/router.js'

const calendarListProcedure = publicProcedure.use(async (opts) => {
  if (opts.ctx.config.jobs.migratePast.enabledMiddlewareTriggers.calendarRouter.calendarListProcedure) {
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

const listingPermissions: calendar.GeneralizedListingOptions = {
  enableProcessAssociations: true,
  pastConcealment: {
    enabled: false,
  },
  restrictEventTagAccess: {
    enabled: false,
  },
}

export const calendarRouter = router({
  latestViewVersion: calendarListProcedure.query((opts) => {
    return opts.ctx.calendarViewVersion
  }),
  listEventsInDay: calendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListEventsInDay)
    .query((opts) => {
      const { year, month, dayOfMonth, clientTimezone } = opts.input
      return calendar.listCalendarItemsInDay(
        year,
        month,
        dayOfMonth,
        clientTimezone,
        opts.ctx.calendarViewVersion,
        listingPermissions,
      )
    }),
  listEventsInWeek: calendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListEventsInWeek)
    .query((opts) => {
      const { year, month, dayOfMonth, clientTimezone } = opts.input
      return calendar.listCalendarItemsInWeek(
        year,
        month,
        dayOfMonth,
        clientTimezone,
        opts.ctx.calendarViewVersion,
        listingPermissions,
      )
    }),
  listEventsInMonth: calendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListEventsInMonth)
    .query((opts) => {
      const { year, month, clientTimezone } = opts.input
      return calendar.listCalendarItemsInMonth(
        year,
        month,
        clientTimezone,
        opts.ctx.calendarViewVersion,
        listingPermissions,
      )
    }),
  listEventsInYear: calendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListEventsInYear)
    .query((opts) => {
      const { year, clientTimezone } = opts.input
      return calendar.listCalendarItemsInYear(year, clientTimezone, opts.ctx.calendarViewVersion, listingPermissions)
    }),
  listFutureEventsInDay: calendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListFutureEventsInDay)
    .query((opts) => {
      const { year, month, dayOfMonth, clientTimezone } = opts.input
      return calendar.listFutureCalendarItemsInDay(
        year,
        month,
        dayOfMonth,
        clientTimezone,
        opts.ctx.calendarViewVersion,
        listingPermissions,
      )
    }),
  listFutureEventsInWeek: calendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListFutureEventsInWeek)
    .query((opts) => {
      const { year, month, dayOfMonth, clientTimezone } = opts.input
      return calendar.listFutureCalendarItemsInWeek(
        year,
        month,
        dayOfMonth,
        clientTimezone,
        opts.ctx.calendarViewVersion,
        listingPermissions,
      )
    }),
  listFutureEventsInMonth: calendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListFutureEventsInMonth)
    .query((opts) => {
      const { year, month, clientTimezone } = opts.input
      return calendar.listFutureCalendarItemsInMonth(
        year,
        month,
        clientTimezone,
        opts.ctx.calendarViewVersion,
        listingPermissions,
      )
    }),
  listFutureEventsInYear: calendarListProcedure
    .input(getConfigurables().validators.apiInput.calendar.zListFutureEventsInYear)
    .query((opts) => {
      const { year, clientTimezone } = opts.input
      return calendar.listFutureCalendarItemsInYear(
        year,
        clientTimezone,
        opts.ctx.calendarViewVersion,
        listingPermissions,
      )
    }),
})
