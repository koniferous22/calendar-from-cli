import { z } from 'zod'
import { zSortedNonEmptyArray } from '../../utils/sortedArray.js'
import { zDayOfWeek, zDayOfMonth, zISOWeekOfMonth, zMonth, zWeekOfYear, zDayOfYear } from '../calendar.js'
import { UniversalConfig } from '../../config/universal.js'

type PeriodLimits = UniversalConfig['inputValidation']['objectFieldLimits']['recurringEvent']['periodLimits']

export const createZRecurringEventSchedule = ({ maxDaily, maxWeekly, maxMonthly, maxYearly }: PeriodLimits) =>
  z
    .object({
      hour: z.number().nonnegative().max(24),
      minute: z.number().nonnegative().max(60),
      repeatsEvery: z.number().positive().default(1),
      dayRecurrence: z.discriminatedUnion('type', [
        z.object({
          type: z.literal('daily'),
        }),
        z.object({
          type: z.literal('weeklySelectDays'),
          days: zSortedNonEmptyArray(zDayOfWeek),
        }),
        z.object({
          type: z.literal('monthlySelectDays'),
          days: zSortedNonEmptyArray(zDayOfMonth),
        }),
        z.object({
          type: z.literal('monthlySelectWeeksDays'),
          weeks: zSortedNonEmptyArray(zISOWeekOfMonth),
          days: zSortedNonEmptyArray(zDayOfWeek),
        }),
        z.object({
          type: z.literal('yearlySelectMonthsWeeksDays'),
          months: zSortedNonEmptyArray(zMonth),
          weeks: zSortedNonEmptyArray(zISOWeekOfMonth),
          days: zSortedNonEmptyArray(zDayOfWeek),
        }),
        z.object({
          type: z.literal('yearlySelectWeeksDays'),
          // Note - mention outliers in the UI
          weeks: zSortedNonEmptyArray(zWeekOfYear),
          days: zSortedNonEmptyArray(zDayOfWeek),
        }),
        z.object({
          type: z.literal('yearlySelectDates'),
          days: z.array(zDayOfYear).nonempty(),
        }),
      ]),
    })
    .superRefine(({ repeatsEvery, dayRecurrence }, ctx) => {
      let periodLimitsInfo = null as null | {
        limit: number
        type: string
      }
      switch (dayRecurrence.type) {
        case 'daily':
          periodLimitsInfo = {
            limit: maxDaily,
            type: 'daily',
          }
          break
        case 'weeklySelectDays':
          periodLimitsInfo = {
            limit: maxWeekly,
            type: 'weekly',
          }
          break
        case 'monthlySelectDays':
        case 'monthlySelectWeeksDays':
          periodLimitsInfo = {
            limit: maxMonthly,
            type: 'monthly',
          }
          break
        case 'yearlySelectMonthsWeeksDays':
        case 'yearlySelectWeeksDays':
        case 'yearlySelectDates':
          periodLimitsInfo = {
            limit: maxYearly,
            type: 'yearly',
          }
          break
      }
      if (periodLimitsInfo && repeatsEvery >= periodLimitsInfo.limit) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          message: `Event exceeds periodic limit set for ${periodLimitsInfo.type} recurrence - ${periodLimitsInfo.limit}`,
          maximum: periodLimitsInfo.limit,
          type: 'number',
          inclusive: true,
        })
      }
    })
