import { router } from './trpc/router.js'
import { eventRouter } from './routers/event.js'
import { eventTagRouter } from './routers/eventTag.js'
import { eventTemplateRouter } from './routers/eventTemplate.js'
import { calendarRouter } from './routers/calendar.js'
import { processTemplateRouter } from './routers/processTemplate.js'
import { processRouter } from './routers/process.js'
import { jobsRouter } from './routers/jobs.js'
import { recurringEventRouter } from './routers/recurringEvent.js'
import { trustedViewerRouter } from './routers/trustedViewer.js'

export const appRouter = router({
  calendar: calendarRouter,
  event: eventRouter,
  eventTag: eventTagRouter,
  eventTemplate: eventTemplateRouter,
  job: jobsRouter,
  process: processRouter,
  processTemplate: processTemplateRouter,
  recurringEvent: recurringEventRouter,
  trustedViewer: trustedViewerRouter,
})
