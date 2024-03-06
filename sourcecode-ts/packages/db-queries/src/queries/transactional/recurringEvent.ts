import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'
import { types } from '@calendar-from-cli/validation-lib'

export const cancelRecurringEvent = async (pc: PrismaClientReusableInTransactions, recurringEventId: number) => {
  const now = new Date()
  return pc.recurringEvent.update({
    where: {
      Id: recurringEventId,
    },
    data: {
      UpdatedAt: now,
      RecurringEventState: 'Cancelled',
    },
  })
}

export const updateRecurringEventSchedule = async (
  pc: PrismaClientReusableInTransactions,
  recurringEventId: number,
  recurrence: types.RecurringEventScheduleSpec,
  duration: number,
  baselineSchedule: Date,
) => {
  const now = new Date()
  return pc.recurringEvent.update({
    where: {
      Id: recurringEventId,
    },
    data: {
      UpdatedAt: now,
      Recurrence: recurrence,
      BaselineUTCSchedule: baselineSchedule,
      Duration: duration,
    },
  })
}
