import { configurable } from '@calendar-from-cli/validation-lib'
import { selectEnumPrompt } from './generic/selectEnum'
import { getConfig } from '../globals/config'
import { fuzzySelect } from './generic/fuzzySelect'
import { createFutureDayOfMonthOptions, createFutureMonthOptions } from '../options/datetimeOptions'
import { timezone } from '../globals/timezone'
import { client } from '../globals/client'

const promptListingYear = () => {
  const currentYear = new Date().getFullYear()
  const availableYears = Array(getConfig().inputValidation.api.calendarList.maxYearsAhead)
    .fill(null)
    .map((_, index) => currentYear + index)
  return fuzzySelect(availableYears, {
    getValue: (year) => year,
    getFuzzyIndex: (year) => year.toString(),
    getDescription: (year) => year.toString(),
    defaultDescription: 'No year selected',
    messages: {
      fuzzySelectMessage: 'Select Year',
    },
  }).then(({ choice }) => choice)
}

const promptListingMonth = async (year: number) => {
  const monthOptions = createFutureMonthOptions(year)
  return (await selectEnumPrompt(monthOptions, 'Select Month')).choice
}

const promptListingDayOfMonth = async (year: number, month: number) => {
  const dayOfMonthOptions = createFutureDayOfMonthOptions(year, month)
  return (
    await fuzzySelect(dayOfMonthOptions, {
      getValue: ({ value }) => value,
      getFuzzyIndex: ({ name }) => name,
      getDescription: ({ name }) => name,
      defaultDescription: 'No Day of Month selected',
      messages: {
        fuzzySelectMessage: 'Select Day of Month',
      },
    })
  ).choice
}

const promptListCalendarEventsByDay = async () => {
  const year = await promptListingYear()
  const month = await promptListingMonth(year)
  const dayOfMonth = await promptListingDayOfMonth(year, month)
  const { lowerLimit, maxYearsAhead } = getConfig().inputValidation.api.calendarList
  const input = configurable.universalValidators.apiInput.calendar
    .createZCalendarListFutureEventsInDayInput(lowerLimit, maxYearsAhead, timezone)
    .parse({
      year,
      month,
      dayOfMonth,
    })
  return client.calendar.listFutureEventsInDay.query(input)
}

const promptListCalendarEventsByWeek = async () => {
  const year = await promptListingYear()
  const month = await promptListingMonth(year)
  const dayOfMonth = await promptListingDayOfMonth(year, month)
  const { lowerLimit, maxYearsAhead } = getConfig().inputValidation.api.calendarList
  const input = configurable.universalValidators.apiInput.calendar
    .createZCalendarListFutureEventsInWeekInput(lowerLimit, maxYearsAhead, timezone)
    .parse({
      year,
      month,
      dayOfMonth,
    })
  return client.calendar.listFutureEventsInWeek.query(input)
}

const promptListCalendarEventsByMonth = async () => {
  const year = await promptListingYear()
  const month = await promptListingMonth(year)
  const { lowerLimit, maxYearsAhead } = getConfig().inputValidation.api.calendarList
  const input = configurable.universalValidators.apiInput.calendar
    .createZCalendarListFutureEventsInMonthInput(lowerLimit, maxYearsAhead, timezone)
    .parse({
      year,
      month,
    })
  return client.calendar.listFutureEventsInMonth.query(input)
}

const promptListCalendarEventsByYear = async () => {
  const year = await promptListingYear()
  const { lowerLimit, maxYearsAhead } = getConfig().inputValidation.api.calendarList
  const input = configurable.universalValidators.apiInput.calendar
    .createZCalendarListFutureEventsInYearInput(lowerLimit, maxYearsAhead, timezone)
    .parse({
      year,
    })
  return client.calendar.listFutureEventsInYear.query(input)
}

const calendarListingInputType = [
  {
    name: 'List Calendar Events in Year',
    value: 'year',
  },
  {
    name: 'List Calendar Events in Month',
    value: 'month',
  },
  {
    name: 'List Calendar Events in Week',
    value: 'week',
  },
  {
    name: 'List Calendar Events in Day',
    value: 'day',
  },
] as const

export const promptListCalendarItems = async () => {
  const operation = await selectEnumPrompt(calendarListingInputType, 'Choose Calendar Range')
  switch (operation.choice) {
    case 'day':
      return promptListCalendarEventsByDay()
    case 'week':
      return promptListCalendarEventsByWeek()
    case 'month':
      return promptListCalendarEventsByMonth()
    case 'year':
      return promptListCalendarEventsByYear()
  }
}
