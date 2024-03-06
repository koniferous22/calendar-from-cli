import { types } from '@calendar-from-cli/validation-lib'
import { formatOrdinalNumber } from '../ordinal-numbers/formatOrdinalNumber.js'
import { pluralizeByFlag } from '../pluralize/pluralizeUtils.js'

const formatDayOfWeek = (dayOfWeek: number) => {
  switch (dayOfWeek) {
    case 0:
      return 'Sunday'
    case 1:
      return 'Monday'
    case 2:
      return 'Tuesday'
    case 3:
      return 'Wednesday'
    case 4:
      return 'Thursday'
    case 5:
      return 'Friday'
    case 6:
      return 'Saturday'
    default:
      throw new Error('Invalid day')
  }
}

const formatMonth = (month: number) => {
  switch (month) {
    case 0:
      return 'January'
    case 1:
      return 'February'
    case 2:
      return 'March'
    case 3:
      return 'April'
    case 4:
      return 'May'
    case 5:
      return 'June'
    case 6:
      return 'July'
    case 7:
      return 'August'
    case 8:
      return 'September'
    case 9:
      return 'October'
    case 10:
      return 'November'
    case 11:
      return 'December'
    default:
      throw new Error('Invalid month')
  }
}

const formatDayOfYear = (month: number, dayOfMonth: number) => `${month}/${dayOfMonth}`

type FormatDayOfWeekOpts = {
  shouldPluralizeDays: boolean
  andInsteadOfComaOnMultipleDays: boolean
}

const formatListOfStrings = (items: string[], useAndInsteadOfComaOnLastItem: boolean) => {
  if (useAndInsteadOfComaOnLastItem) {
    if (items.length === 1) {
      return `${items[0]}`
    }
    return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
  }
  return `${items.join(', ')}`
}

const formatListOfOrdinalNumbers = (ordinalNumbers: number[], useAndInsteadOfComaOnLastItem: boolean) =>
  formatListOfStrings(ordinalNumbers.map(formatOrdinalNumber), useAndInsteadOfComaOnLastItem)

const formatDaysOfWeek = (
  daysOfWeek: number[],
  { shouldPluralizeDays, andInsteadOfComaOnMultipleDays }: FormatDayOfWeekOpts,
) =>
  formatListOfStrings(
    daysOfWeek.map((dayOfWeek) => pluralizeByFlag(formatDayOfWeek(dayOfWeek), shouldPluralizeDays)),
    andInsteadOfComaOnMultipleDays,
  )

const formatWeeksOfMonth = (weeksOfMonth: number[], useAndInsteadOfComaOnLastItem: boolean) =>
  formatListOfOrdinalNumbers(weeksOfMonth, useAndInsteadOfComaOnLastItem)

const formatDaysOfMonth = (daysOfMonth: number[], useAndInsteadOfComaOnLastItem: boolean) =>
  formatListOfOrdinalNumbers(daysOfMonth, useAndInsteadOfComaOnLastItem)

const formatMonths = (months: number[], useAndInsteadOfComaOnLastItem: boolean) =>
  formatListOfStrings(months.map(formatMonth), useAndInsteadOfComaOnLastItem)

const formatWeeksOfYear = (weeksOfYear: number[], useAndInsteadOfComaOnLastItem: boolean) =>
  formatListOfOrdinalNumbers(weeksOfYear, useAndInsteadOfComaOnLastItem)

const formatRecurringEventRecurrence = (
  dayRecurrence: types.RecurringEventScheduleSpec['dayRecurrence'],
  repeatsEvery: number,
) => {
  switch (dayRecurrence.type) {
    case 'daily':
      return repeatsEvery === 1 ? `Every Day` : `Every ${repeatsEvery} Days`
    case 'weeklySelectDays':
      return repeatsEvery === 1
        ? `Every ${formatDaysOfWeek(dayRecurrence.days, {
            shouldPluralizeDays: false,
            andInsteadOfComaOnMultipleDays: true,
          })}`
        : `${formatDaysOfWeek(dayRecurrence.days, {
            shouldPluralizeDays: true,
            andInsteadOfComaOnMultipleDays: false,
          })} Every ${formatOrdinalNumber(repeatsEvery)} Week`
    case 'monthlySelectWeeksDays':
      return repeatsEvery === 1
        ? `Every ${formatDaysOfWeek(dayRecurrence.days, {
            shouldPluralizeDays: false,
            andInsteadOfComaOnMultipleDays: false,
          })} of ${formatWeeksOfMonth(dayRecurrence.weeks, true)} of Every Month`
        : `Every ${formatDaysOfWeek(dayRecurrence.days, {
            shouldPluralizeDays: false,
            andInsteadOfComaOnMultipleDays: false,
          })} of ${formatWeeksOfMonth(dayRecurrence.weeks, true)} of Every ${formatOrdinalNumber(repeatsEvery)} Month`
    case 'monthlySelectDays':
      return repeatsEvery === 1
        ? `Every ${formatDaysOfMonth(dayRecurrence.days, true)} Day of Every Month`
        : `Every ${formatDaysOfMonth(dayRecurrence.days, true)} Day of Every ${formatOrdinalNumber(repeatsEvery)} Month`
    case 'yearlySelectMonthsWeeksDays':
      return repeatsEvery === 1
        ? `Every ${formatDaysOfWeek(dayRecurrence.days, {
            shouldPluralizeDays: false,
            andInsteadOfComaOnMultipleDays: false,
          })} of Every ${formatWeeksOfMonth(dayRecurrence.weeks, false)} Week of Every ${formatMonths(
            dayRecurrence.months,
            true,
          )}`
        : `Every ${formatDaysOfWeek(dayRecurrence.days, {
            shouldPluralizeDays: false,
            andInsteadOfComaOnMultipleDays: false,
          })} of Every ${formatWeeksOfMonth(dayRecurrence.weeks, false)} Week of ${formatMonths(
            dayRecurrence.months,
            false,
          )} Every ${repeatsEvery} Years`
    case 'yearlySelectWeeksDays':
      return repeatsEvery === 1
        ? `Every ${formatDaysOfWeek(dayRecurrence.days, {
            shouldPluralizeDays: false,
            andInsteadOfComaOnMultipleDays: false,
          })} of Every ${formatWeeksOfYear(dayRecurrence.weeks, true)} Calendar Week`
        : `Every ${formatDaysOfWeek(dayRecurrence.days, {
            shouldPluralizeDays: false,
            andInsteadOfComaOnMultipleDays: false,
          })} of ${formatWeeksOfYear(dayRecurrence.weeks, true)} Calendar Week of Every ${formatOrdinalNumber(
            repeatsEvery,
          )} Year`
    case 'yearlySelectDates':
      const formattedDaysOfYear = formatListOfStrings(
        dayRecurrence.days.map(({ month, dayOfMonth }) => formatDayOfYear(month, dayOfMonth)),
        true,
      )
      return repeatsEvery === 1 ? `Every ${formattedDaysOfYear}` : `${formattedDaysOfYear} Every ${repeatsEvery} Years`
  }
}

export const formatRecurringEventSchedule = ({
  dayRecurrence,
  hour,
  minute,
  repeatsEvery,
}: types.RecurringEventScheduleSpec) => {
  const formattedRecurrence = formatRecurringEventRecurrence(dayRecurrence, repeatsEvery)
  const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  return `Repeats ${formattedRecurrence} at ${formattedTime}`
}
