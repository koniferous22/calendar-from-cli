const generateOptionsRangeFromToWithSuffix = (from: number, to: number, suffix: string) =>
  Array(to - from + 1)
    .fill({})
    .map((_, i) => ({
      value: from + i,
      name: `${from + i} ${suffix}`,
    }))

const generateOptionsRangeFromTo = (from: number, to: number) =>
  Array(to - from + 1)
    .fill({})
    .map((_, i) => ({
      value: from + i,
      name: `${from + i}`,
    }))

export const dayOfWeekOptions = [
  {
    value: 0,
    name: 'Sunday',
  },
  {
    value: 1,
    name: 'Monday',
  },
  {
    value: 2,
    name: 'Tuesday',
  },
  {
    value: 3,
    name: 'Wednesday',
  },
  {
    value: 4,
    name: 'Thursday',
  },
  {
    value: 5,
    name: 'Friday',
  },
  {
    value: 6,
    name: 'Saturday',
  },
] as const

export const monthOptions = [
  {
    value: 0,
    name: 'January',
  },
  {
    value: 1,
    name: 'February',
  },
  {
    value: 2,
    name: 'March',
  },
  {
    value: 3,
    name: 'April',
  },
  {
    value: 4,
    name: 'May',
  },
  {
    value: 5,
    name: 'June',
  },
  {
    value: 6,
    name: 'July',
  },
  {
    value: 7,
    name: 'August',
  },
  {
    value: 8,
    name: 'September',
  },
  {
    value: 9,
    name: 'October',
  },
  {
    value: 10,
    name: 'November',
  },
  {
    value: 11,
    name: 'December',
  },
] as const

export const weekOfMonthOptions = generateOptionsRangeFromTo(1, 4).concat(
  generateOptionsRangeFromToWithSuffix(5, 5, '(If present)'),
)
export const dayOfMonthOptions = generateOptionsRangeFromTo(1, 28).concat(
  generateOptionsRangeFromToWithSuffix(29, 31, '(If present)'),
)
export const weekOfYearOptions = generateOptionsRangeFromTo(1, 52).concat(
  generateOptionsRangeFromToWithSuffix(53, 53, '(If present)'),
)

// Note - 0-indexed months
const dayMonthOccursOnLeapYear = (month: number, day: number) => month === 1 && day === 29

export const dateOfYearOptions = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31].flatMap((days, month) =>
  Array(days)
    .fill(null)
    .map((_, day) => ({
      value: {
        month,
        dayOfMonth: day + 1,
      },
      name: `${monthOptions.find(({ value }) => value == month)!.name} ${(day + 1).toString().padStart(2, '0')}${
        dayMonthOccursOnLeapYear(month, day + 1) ? ' (If present)' : ''
      }`,
    })),
)

export const hourMinuteOptions = Array(24)
  .fill(null)
  .flatMap((_, hour) =>
    Array(60)
      .fill(null)
      .map((_, minute) => ({
        value: [hour, minute] as const,
        name: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      })),
  )

export const createFutureMonthOptions = (year: number) => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  if (year > currentYear) {
    return monthOptions
  } else if (year === currentYear) {
    return monthOptions.filter(({ value }) => value >= currentMonth)
  }
  throw new Error(`Cannot provide month for past year - ${year}`)
}

export const createFutureDayOfMonthOptions = (year: number, month: number) => {
  const now = new Date()
  // Note - 0th day of month is last day of prev month
  // https://github.com/date-fns/date-fns/blob/main/src/getDaysInMonth/index.ts
  const daysInTargetMonth = new Date(year, month + 1, 0, 0, 0, 0, 0).getDate()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentDayOfMonth = now.getDay()
  if (year > currentYear || month > currentMonth) {
    return Array(daysInTargetMonth)
      .fill(null)
      .map((_, day) => ({
        value: day + 1,
        name: `${(day + 1).toString().padStart(2, '0')}`,
      }))
  } else if (year === currentYear && month === currentMonth) {
    return Array(daysInTargetMonth - currentDayOfMonth + 1)
      .fill(null)
      .map((_, day) => ({
        value: currentDayOfMonth + day,
        name: `${(currentDayOfMonth + day + 1).toString().padStart(2, '0')}`,
      }))
  }
  throw new Error(`Cannot provide days for past month - ${year}/${month.toString().padStart(2, '0')}`)
}
