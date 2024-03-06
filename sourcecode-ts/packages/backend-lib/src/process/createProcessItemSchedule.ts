import { duration, processItemSchedule } from '@calendar-from-cli/calendar-utils'
import { types } from '@calendar-from-cli/validation-lib'
import { ProcessItem } from './types.js'

type ProcessItemOffsetSchedule<ProcessItemT extends ProcessItem> = {
  processItem: ProcessItemT
  scheduledAtUTC: Date
  calculatedOffsetInMinutes: number
}

export const createProcessItemScheduleFromProcessItemOffsets = <ProcessItemT extends ProcessItem>(
  scheduleBaselineUTC: Date,
  timezone: string,
  processItems: ProcessItemT[],
  retrieveOffset: (_: ProcessItemT) => types.ProcessItemOffsetSpec,
  retrieveDuration: (_: ProcessItemT) => number,
) => {
  const scheduleTemplateItemsArgs: Array<ProcessItemOffsetSchedule<ProcessItemT>> = []
  let previousEventEnd = scheduleBaselineUTC
  for (const processItem of processItems) {
    const scheduledAtUTC = processItemSchedule.resolveProcessItemSchedule(
      previousEventEnd,
      timezone,
      retrieveOffset(processItem),
    )
    const calculatedOffsetInMinutes = duration.timeDiffInMinutes(scheduledAtUTC, previousEventEnd)
    scheduleTemplateItemsArgs.push({
      processItem,
      scheduledAtUTC,
      calculatedOffsetInMinutes,
    })
    previousEventEnd = duration.calculateEndsAtFromBeginAndDuration(scheduledAtUTC, retrieveDuration(processItem))
  }
  return scheduleTemplateItemsArgs
}

type ResolvedOffsetSchedule<ProcessItemT> = {
  processItem: ProcessItemT
  scheduledAtUTC: Date
}
export const createProcessItemScheduleFromResolvedOffsets = <ProcessItemT extends ProcessItem>(
  scheduleBaselineUTC: Date,
  processItems: ProcessItemT[],
  retrieveCalculatedOffsetInMinutes: (_: ProcessItemT) => number,
  retrieveDuration: (_: ProcessItemT) => number,
) => {
  const rescheduleEventPreserveOffsetArgs: Array<ResolvedOffsetSchedule<ProcessItemT>> = []
  let previousProcessItemEndsAtUTC = scheduleBaselineUTC
  for (const processItem of processItems) {
    // Simply Shifts time by minutes
    const scheduledAtUTC = duration.calculateEndsAtFromBeginAndDuration(
      previousProcessItemEndsAtUTC,
      retrieveCalculatedOffsetInMinutes(processItem),
    )
    rescheduleEventPreserveOffsetArgs.push({
      processItem,
      scheduledAtUTC,
    })
    previousProcessItemEndsAtUTC = duration.calculateEndsAtFromBeginAndDuration(
      scheduledAtUTC,
      retrieveDuration(processItem),
    )
  }
  return rescheduleEventPreserveOffsetArgs
}
