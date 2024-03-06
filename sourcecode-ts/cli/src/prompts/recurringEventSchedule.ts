import { z } from 'zod'
import { multiselectEnumPrompt } from './generic/multiselectEnum.js'
import {
  dateOfYearOptions,
  dayOfMonthOptions,
  dayOfWeekOptions,
  monthOptions,
  weekOfMonthOptions,
  weekOfYearOptions,
} from '../options/datetimeOptions.js'
import inquirer from 'inquirer'
import { fuzzyMultiselectEnumPrompt } from './generic/fuzzyMultiselectEnum.js'
import { primitives } from '@calendar-from-cli/validation-lib'

type DayRecurrence = z.infer<ReturnType<typeof primitives.createZRecurringEventSchedule>>['dayRecurrence']

const multiselectDaysOfWeek = async (): Promise<number[]> => {
  return multiselectEnumPrompt(dayOfWeekOptions, 'Select Days of the Week').then(({ choices }) => choices)
}

const multiselectDaysOfMonth = async (): Promise<number[]> => {
  return multiselectEnumPrompt(dayOfMonthOptions, 'Select Days of Month').then(({ choices }) => choices)
}

const multiselectWeeksOfMonth = async (): Promise<number[]> => {
  return multiselectEnumPrompt(weekOfMonthOptions, 'Select Weeks of Month').then(({ choices }) => choices)
}

const multiselectWeeksOfYear = async (): Promise<number[]> => {
  return fuzzyMultiselectEnumPrompt(weekOfYearOptions, 'Select Weeks of the Year').then(({ choices }) => choices)
}

const multiselectDateOfYear = async (): Promise<Extract<DayRecurrence, { type: 'yearlySelectDates' }>['days']> => {
  return fuzzyMultiselectEnumPrompt(dateOfYearOptions, 'Select Dates within Year').then(({ choices }) => choices) as any
}

const multiselectMonths = async (): Promise<number[]> => {
  return multiselectEnumPrompt(monthOptions, 'Select Months').then(({ choices }) => choices)
}

const promptRecurrenceDailyType = async (): Promise<Extract<DayRecurrence, { type: 'daily' }>> => {
  return {
    type: 'daily' as const,
  }
}

const promptRecurrenceWeeklySelectDaysType = async (): Promise<
  Extract<DayRecurrence, { type: 'weeklySelectDays' }>
> => {
  const days = await multiselectDaysOfWeek()
  return {
    type: 'weeklySelectDays',
    days,
  }
}

const promptRecurrenceMonthlySelectWeeksDaysType = async (): Promise<
  Extract<DayRecurrence, { type: 'monthlySelectWeeksDays' }>
> => {
  const weeks = await multiselectWeeksOfMonth()
  const days = await multiselectDaysOfWeek()
  return {
    type: 'monthlySelectWeeksDays',
    days,
    weeks,
  }
}

const promptRecurrenceMonthlySelectDaysType = async (): Promise<
  Extract<DayRecurrence, { type: 'monthlySelectDays' }>
> => {
  const days = await multiselectDaysOfMonth()
  return {
    type: 'monthlySelectDays',
    days,
  }
}

const promptRecurrenceYearlySelectMonthsWeeksDaysType = async (): Promise<
  Extract<DayRecurrence, { type: 'yearlySelectMonthsWeeksDays' }>
> => {
  const months = await multiselectMonths()
  const weeks = await multiselectWeeksOfMonth()
  const days = await multiselectDaysOfWeek()
  return {
    type: 'yearlySelectMonthsWeeksDays',
    months,
    weeks,
    days,
  }
}

const promptRecurrenceYearlySelectWeeksDaysType = async (): Promise<
  Extract<DayRecurrence, { type: 'yearlySelectWeeksDays' }>
> => {
  const weeks = await multiselectWeeksOfYear()
  const days = await multiselectDaysOfWeek()
  return {
    type: 'yearlySelectWeeksDays',
    weeks,
    days,
  }
}

const promptRecurrenceYearlySelectDatesType = async (): Promise<
  Extract<DayRecurrence, { type: 'yearlySelectDates' }>
> => {
  const days = await multiselectDateOfYear()
  return {
    type: 'yearlySelectDates',
    days,
  }
}
const dayRecurrenceOptions: { value: DayRecurrence['type']; name: string }[] = [
  {
    value: 'daily',
    name: 'Daily',
  },
  {
    value: 'weeklySelectDays',
    name: 'Weekly - Select Days of the Week',
  },
  {
    value: 'monthlySelectWeeksDays',
    name: 'Monthly - Select Weeks and Days of the Week',
  },
  {
    value: 'monthlySelectDays',
    name: 'Monthly - Select Days of the Month',
  },
  {
    value: 'yearlySelectMonthsWeeksDays',
    name: 'Yearly - Select Months, Weeks and Days of the Week',
  },
  {
    value: 'yearlySelectWeeksDays',
    name: 'Yearly - Select Weeks of the Year and Days of the Week',
  },
  {
    value: 'yearlySelectDates',
    name: 'Yearly - Select Dates',
  },
]

export const promptRecurringEventSchedule = async (): Promise<DayRecurrence> => {
  const { recurrence } = await inquirer.prompt<{ recurrence: DayRecurrence['type'] }>([
    {
      type: 'list',
      name: 'recurrence',
      message: 'Choose Event Recurrence',
      choices: dayRecurrenceOptions,
    },
  ])

  switch (recurrence) {
    case 'daily':
      return promptRecurrenceDailyType()
    case 'weeklySelectDays':
      return promptRecurrenceWeeklySelectDaysType()
    case 'monthlySelectWeeksDays':
      return promptRecurrenceMonthlySelectWeeksDaysType()
    case 'monthlySelectDays':
      return promptRecurrenceMonthlySelectDaysType()
    case 'yearlySelectMonthsWeeksDays':
      return promptRecurrenceYearlySelectMonthsWeeksDaysType()
    case 'yearlySelectWeeksDays':
      return promptRecurrenceYearlySelectWeeksDaysType()
    case 'yearlySelectDates':
      return promptRecurrenceYearlySelectDatesType()
    default:
      throw new Error('Invalid Event Recurrence Type selected')
  }
}
