import { router } from './trpc/router.js'
import { calendarRouter } from './routers/calendar.js'
import { trustedViewerRouter } from './routers/trustedViewer.js'

export const appRouter = router({
  calendar: calendarRouter,
  trustedViewer: trustedViewerRouter,
})
