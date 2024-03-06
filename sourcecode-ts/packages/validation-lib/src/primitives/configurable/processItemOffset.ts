import { z } from 'zod'
import { UniversalConfig } from '../../config/universal.js'
import {
  zDayOfMonth,
  zDayOfWeek,
  zDayOfYear,
  zHour,
  zISOWeekOfMonth,
  zMinute,
  zMonth,
  zWeekOfYear,
} from '../calendar.js'

type OffsetGapLimits = UniversalConfig['inputValidation']['objectFieldLimits']['processTemplate']['offsetGapLimits']

const createZGap = (maxAmount: number) => z.number().nonnegative().max(maxAmount).default(0)

export const createZProcessItemOffset = ({
  maxHourGap,
  maxDayGap,
  maxWeekGap,
  maxMonthGap,
  maxYearGap,
}: OffsetGapLimits) =>
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal('immediatellyAfter'),
      gapHours: createZGap(maxHourGap),
      gapMinutes: createZGap(60),
    }),
    z.object({
      type: z.literal('nearestTimeOfDay'),
      hour: zHour,
      minute: zMinute,
      gapDays: createZGap(maxDayGap),
    }),
    z.object({
      type: z.literal('nearestDayOfWeek'),
      dayOfWeek: zDayOfWeek,
      hour: zHour,
      minute: zMinute,
      gapWeeks: createZGap(maxWeekGap),
    }),
    z.object({
      type: z.literal('nearestDayOfWeekInMonth'),
      weekOfMonth: zISOWeekOfMonth,
      dayOfWeek: zDayOfWeek,
      hour: zHour,
      minute: zMinute,
      gapMonths: createZGap(maxMonthGap),
    }),
    z.object({
      type: z.literal('nearestDayOfMonth'),
      dayOfMonth: zDayOfMonth,
      hour: zHour,
      minute: zMinute,
      gapMonths: createZGap(maxMonthGap),
    }),
    z.object({
      type: z.literal('nearestDayOfWeekOfMonthInYear'),
      month: zMonth,
      weekOfMonth: zISOWeekOfMonth,
      dayOfWeek: zDayOfWeek,
      hour: zHour,
      minute: zMinute,
      gapYears: createZGap(maxYearGap),
    }),
    z.object({
      type: z.literal('nearestDayOfWeekInYear'),
      weekOfYear: zWeekOfYear,
      dayOfWeek: zDayOfWeek,
      hour: zHour,
      minute: zMinute,
      gapYears: createZGap(maxYearGap),
    }),
    z.object({
      type: z.literal('nearestDateOfYear'),
      dayOfYear: zDayOfYear,
      hour: zHour,
      minute: zMinute,
      gapYears: createZGap(maxYearGap),
    }),
  ])
