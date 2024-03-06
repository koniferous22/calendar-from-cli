import { queries, types } from '@calendar-from-cli/db-queries'
import { createProcessItemScheduleFromProcessItemOffsets } from './createProcessItemSchedule.js'
import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'

export const scheduleProcessItemAttachmentsFromProcessTemplateItems = async (
  pc: PrismaClientReusableInTransactions,
  processId: number,
  processTemplate: NonNullable<Awaited<ReturnType<typeof queries.findProcessTemplateByAlias>>>,
  fallbackPublicValues: types.ScheduleEventFallbackPublicValues,
  scheduleBaselineUTC: Date,
  timezone: string,
  now: Date,
) => {
  const scheduleEventsAsProcessItemsArgs = createProcessItemScheduleFromProcessItemOffsets(
    scheduleBaselineUTC,
    timezone,
    processTemplate.ProcessTemplateItem,
    // ? zod parser
    (item) => item.ItemOffset as any,
    (item) => item.EventTemplate.Duration,
  )
  // Array length of process template items validated on API level
  const processStartsAt = scheduleEventsAsProcessItemsArgs[0].scheduledAtUTC
  await Promise.all(
    scheduleEventsAsProcessItemsArgs.map(async ({ processItem, scheduledAtUTC, calculatedOffsetInMinutes }) =>
      queries.transactional.scheduleEventAsProcessItem(
        pc,
        processItem,
        fallbackPublicValues,
        scheduledAtUTC,
        calculatedOffsetInMinutes,
        processId,
        processTemplate.EventTagId,
        now,
      ),
    ),
  )
  await queries.transactional.updateProcessStartByProcessId(pc, processId, processStartsAt)
  return queries.transactional.findProcessById(pc, processId)
}
