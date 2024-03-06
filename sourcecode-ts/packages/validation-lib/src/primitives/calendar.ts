import { z } from 'zod'

export const zHour = z.number().nonnegative().max(24)
export const zMinute = z.number().nonnegative().max(60)

export const zDayOfWeek = z.number().nonnegative().max(6)

export const zDayOfMonth = z.number().positive().max(31)

export const zISOWeekOfMonth = z.number().positive().max(5)

export const zWeekOfYear = z.number().positive().max(53)

export const zMonth = z.number().nonnegative().max(11)

export const zDayOfYear = z.union([
  z.object({ month: z.literal(0), dayOfMonth: z.number().positive().max(31) }),
  // Note - mention outliers in the UI
  z.object({ month: z.literal(1), dayOfMonth: z.number().positive().max(29) }),
  z.object({ month: z.literal(2), dayOfMonth: z.number().positive().max(31) }),
  z.object({ month: z.literal(3), dayOfMonth: z.number().positive().max(30) }),
  z.object({ month: z.literal(4), dayOfMonth: z.number().positive().max(31) }),
  z.object({ month: z.literal(5), dayOfMonth: z.number().positive().max(30) }),
  z.object({ month: z.literal(6), dayOfMonth: z.number().positive().max(31) }),
  z.object({ month: z.literal(7), dayOfMonth: z.number().positive().max(31) }),
  z.object({ month: z.literal(8), dayOfMonth: z.number().positive().max(30) }),
  z.object({ month: z.literal(9), dayOfMonth: z.number().positive().max(31) }),
  z.object({ month: z.literal(10), dayOfMonth: z.number().positive().max(30) }),
  z.object({ month: z.literal(11), dayOfMonth: z.number().positive().max(31) }),
])
