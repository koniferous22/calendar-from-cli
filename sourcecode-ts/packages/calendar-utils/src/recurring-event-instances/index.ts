import { types } from '@calendar-from-cli/validation-lib'
import {
  generateDailyRecurringEventInstances,
  generateMonthlySelectDaysRecurringEventInstances,
  generateMonthlySelectWeeksDaysRecurringEventInstances,
  generateWeeklySelectDaysRecurringEventInstances,
  generateYearlySelectDaysRecurringEventInstances,
  generateYearlySelectMonthsWeeksDaysRecurringEventInstances,
  generateYearlySelectWeeksDaysRecurringEventInstances,
} from './generators.js'

export const getRecurringEventInstanceGenerator = (
  baseline: Date,
  localeTimezone: string,
  { hour, minute, dayRecurrence, repeatsEvery }: types.RecurringEventScheduleSpec,
) => {
  switch (dayRecurrence.type) {
    case 'daily':
      return generateDailyRecurringEventInstances(hour, minute, baseline, localeTimezone, 1)
    case 'weeklySelectDays':
      return generateWeeklySelectDaysRecurringEventInstances(
        hour,
        minute,
        dayRecurrence.days,
        baseline,
        localeTimezone,
        repeatsEvery,
      )
    case 'monthlySelectWeeksDays':
      return generateMonthlySelectWeeksDaysRecurringEventInstances(
        hour,
        minute,
        dayRecurrence.weeks,
        dayRecurrence.days,
        baseline,
        localeTimezone,
        repeatsEvery,
      )
    case 'monthlySelectDays':
      return generateMonthlySelectDaysRecurringEventInstances(
        hour,
        minute,
        dayRecurrence.days,
        baseline,
        localeTimezone,
        repeatsEvery,
      )
    case 'yearlySelectMonthsWeeksDays':
      return generateYearlySelectMonthsWeeksDaysRecurringEventInstances(
        hour,
        minute,
        dayRecurrence.months,
        dayRecurrence.weeks,
        dayRecurrence.days,
        baseline,
        localeTimezone,
        repeatsEvery,
      )
    case 'yearlySelectWeeksDays':
      return generateYearlySelectWeeksDaysRecurringEventInstances(
        hour,
        minute,
        dayRecurrence.weeks,
        dayRecurrence.days,
        baseline,
        localeTimezone,
        repeatsEvery,
      )
    case 'yearlySelectDates':
      return generateYearlySelectDaysRecurringEventInstances(
        hour,
        minute,
        dayRecurrence.days,
        baseline,
        localeTimezone,
        repeatsEvery,
      )
  }
}

export const getRecurringEventBaselineUTCSchedule = (
  since: Date,
  localeTimezone: string,
  recurringEventSchedule: types.RecurringEventScheduleSpec,
) => getRecurringEventInstanceGenerator(since, localeTimezone, recurringEventSchedule).next().value!
