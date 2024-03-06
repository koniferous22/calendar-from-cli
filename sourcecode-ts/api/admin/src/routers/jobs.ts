import { jobs } from '@calendar-from-cli/backend-lib'
import { getConfig } from '../config/config.js'
import { publicProcedure } from '../trpc/procedures.js'
import { router } from '../trpc/router.js'

export const jobsRouter = router({
  ...(getConfig().jobs.calendarCleanup.enabledEndpointTrigger
    ? {
        cleanup: publicProcedure.mutation(async () => {
          return jobs.calendarCleanup()
        }),
      }
    : {}),
})
