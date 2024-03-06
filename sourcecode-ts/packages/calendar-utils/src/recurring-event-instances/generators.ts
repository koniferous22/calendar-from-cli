import { addDays, addMonths, getISOWeeksInYear, getWeeksInMonth } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import {
  getUTCBeginningOfCurrentMonth,
  getUTCBeginningOfCurrentWeek,
  getUTCBeginningOfCurrentYear,
  getUTCBeginningOfNextMonth,
  getUTCBeginningOfNextWeek,
} from '../date/utc.js'
import {
  addDSTAdjustedUTCDays,
  addDSTAdjustedUTCWeeks,
  addDSTAdjustedUTCMonths,
  addDSTAdjustedUTCYears,
  calculateDSTAdjustedHourMinuteOffsetForTimezone,
} from '../date/dst.js'

// Util finite generators

// Brief philosophy explanation
// 1. everything related to calculating calendar day is done in UTC
// 2. exact time of recurring event instance is determined by calculating hours, minutes and timezone offset to the beginning of the day in UTC

function* generateInstancesWithinWeekByDayOfWeek(
  baseline: Date,
  localeTimezone: string,
  hour: number,
  minute: number,
  daysOfWeek: number[],
) {
  const { event: baselineEventAtBeginOfWeek } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    getUTCBeginningOfCurrentWeek(baseline),
    hour,
    minute,
    localeTimezone,
  )
  for (const day of daysOfWeek) {
    const { event } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
      addDays(baselineEventAtBeginOfWeek, day),
      hour,
      minute,
      localeTimezone,
    )
    if (event > baseline) {
      yield event
    }
  }
}

function* generateInstancesWithinMonthByWeekAndDay(
  baseline: Date,
  localeTimezone: string,
  hour: number,
  minute: number,
  weeksOfMonth: number[],
  daysOfWeek: number[],
  shouldGenerateEachFullWeek: boolean,
  skip1stWeekOfMonth: boolean,
) {
  const { event: baselineEventAtBeginOfMonth } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    getUTCBeginningOfCurrentMonth(baseline),
    hour,
    minute,
    localeTimezone,
  )
  let weeksOfMonthToIterate = weeksOfMonth
  if (weeksOfMonthToIterate.includes(1) && shouldGenerateEachFullWeek && !skip1stWeekOfMonth) {
    yield* generateInstancesWithinWeekByDayOfWeek(
      getUTCBeginningOfCurrentWeek(baselineEventAtBeginOfMonth),
      localeTimezone,
      hour,
      minute,
      daysOfWeek,
    )
  }
  if ((weeksOfMonthToIterate.includes(1) && shouldGenerateEachFullWeek) || skip1stWeekOfMonth) {
    weeksOfMonthToIterate = weeksOfMonthToIterate.filter((week) => week !== 1)
  }
  for (const weekOfMonth of weeksOfMonthToIterate) {
    const weekOfMonthBegin = getUTCBeginningOfCurrentWeek(
      addDSTAdjustedUTCWeeks(baselineEventAtBeginOfMonth, weekOfMonth - 1, localeTimezone),
    )
    // Note - use case for skipping 1st week of month, is to avoid generating duplicate events when generating two consecutive months
    if (!shouldGenerateEachFullWeek && getUTCBeginningOfNextWeek(weekOfMonthBegin) < baseline) {
      continue
    }
    const weekOfMonthBaseline = weekOfMonthBegin > baseline ? weekOfMonthBegin : baseline
    yield* generateInstancesWithinWeekByDayOfWeek(weekOfMonthBaseline, localeTimezone, hour, minute, daysOfWeek)
  }
}

function* generateInstancesWithinMonthByDate(
  baseline: Date,
  localeTimezone: string,
  hour: number,
  minute: number,
  daysOfMonth: number[],
) {
  const { event: baselineEventAtBeginOfMonth } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    getUTCBeginningOfCurrentMonth(baseline),
    hour,
    minute,
    localeTimezone,
  )
  for (const day of daysOfMonth) {
    const { event } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
      addDays(baselineEventAtBeginOfMonth, day - 1),
      hour,
      minute,
      localeTimezone,
    )
    // Yield if the event is after baseline, but still in current month
    if (
      event > baseline &&
      utcToZonedTime(event, localeTimezone).getMonth() === baselineEventAtBeginOfMonth.getUTCMonth()
    ) {
      yield event
    }
  }
}

function* generateInstancesWithinYearByMonthWeekAndDay(
  baseline: Date,
  localeTimezone: string,
  hour: number,
  minute: number,
  monthsOfYear: number[],
  weeksOfMonth: number[],
  daysOfWeek: number[],
  shouldGenerateEachFullWeek: boolean,
  skip1stWeekOfYear: boolean,
) {
  const { event: baselineEventAtBeginOfYear } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    getUTCBeginningOfCurrentYear(baseline),
    hour,
    minute,
    localeTimezone,
  )
  let monthsToIterate = monthsOfYear
  let totalWeeksInCurrentMonth = getWeeksInMonth(baselineEventAtBeginOfYear)
  let yieldedLastWeekOfMonthInPrevIteration = false
  let previousMonth = baseline
  if (monthsOfYear.includes(0) && weeksOfMonth.includes(1) && shouldGenerateEachFullWeek) {
    yield* generateInstancesWithinMonthByWeekAndDay(
      baselineEventAtBeginOfYear,
      localeTimezone,
      hour,
      minute,
      weeksOfMonth,
      daysOfWeek,
      true,
      skip1stWeekOfYear,
    )
    monthsToIterate = monthsToIterate.filter((month) => month !== 0)
    yieldedLastWeekOfMonthInPrevIteration = weeksOfMonth.includes(totalWeeksInCurrentMonth)
  }
  for (const month of monthsToIterate) {
    const currentMonthBegin = getUTCBeginningOfCurrentMonth(
      addDSTAdjustedUTCMonths(baselineEventAtBeginOfYear, month, localeTimezone),
    )
    if (!shouldGenerateEachFullWeek && getUTCBeginningOfNextMonth(currentMonthBegin) < baseline) {
      continue
    }
    const monthBaseline = currentMonthBegin > baseline ? currentMonthBegin : baseline
    // IF I'm generating everything ~> then I'm generating everything
    // If I'm not generating everything ~> fully generate every week except 1st month
    const shouldGenerateEachFullWeekOfMonth = shouldGenerateEachFullWeek || currentMonthBegin > baseline
    const wasPreviousMonthGenerated = currentMonthBegin.getUTCMonth() === previousMonth.getUTCMonth() + 1
    yield* generateInstancesWithinMonthByWeekAndDay(
      monthBaseline,
      localeTimezone,
      hour,
      minute,
      weeksOfMonth,
      daysOfWeek,
      shouldGenerateEachFullWeekOfMonth,
      wasPreviousMonthGenerated && yieldedLastWeekOfMonthInPrevIteration,
    )
    totalWeeksInCurrentMonth = getWeeksInMonth(currentMonthBegin)
    yieldedLastWeekOfMonthInPrevIteration = weeksOfMonth.includes(totalWeeksInCurrentMonth)
    previousMonth = currentMonthBegin
  }
}

function* generateInstancesWithinYearByWeekAndDay(
  baseline: Date,
  localeTimezone: string,
  hour: number,
  minute: number,
  weeksOfYear: number[],
  daysOfWeek: number[],
  shouldGenerateEachFullWeek: boolean,
  skip1stWeekOfYear: boolean,
) {
  const { event: baselineEventAtBeginOfYear } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    getUTCBeginningOfCurrentYear(baseline),
    hour,
    minute,
    localeTimezone,
  )
  let weeksOfYearToIterate = weeksOfYear
  if (weeksOfYearToIterate.includes(1) && shouldGenerateEachFullWeek && !skip1stWeekOfYear) {
    yield* generateInstancesWithinWeekByDayOfWeek(
      getUTCBeginningOfCurrentWeek(baselineEventAtBeginOfYear),
      localeTimezone,
      hour,
      minute,
      daysOfWeek,
    )
  }
  if ((weeksOfYearToIterate.includes(1) && shouldGenerateEachFullWeek) || skip1stWeekOfYear) {
    weeksOfYearToIterate = weeksOfYearToIterate.filter((week) => week !== 1)
  }
  for (const weekOfYear of weeksOfYearToIterate) {
    const weekOfMonthBegin = getUTCBeginningOfCurrentWeek(
      addDSTAdjustedUTCWeeks(baselineEventAtBeginOfYear, weekOfYear - 1, localeTimezone),
    )
    // Note - use case for skipping 1st week of month, is to avoid generating duplicate events when generating two consecutive months
    if (!shouldGenerateEachFullWeek && getUTCBeginningOfNextWeek(weekOfMonthBegin) < baseline) {
      continue
    }
    const weekOfMonthBaseline = weekOfMonthBegin > baseline ? weekOfMonthBegin : baseline
    yield* generateInstancesWithinWeekByDayOfWeek(weekOfMonthBaseline, localeTimezone, hour, minute, daysOfWeek)
  }
}

function* generateInstancesWithinYearByDate(
  baseline: Date,
  localeTimezone: string,
  hour: number,
  minute: number,
  datesOfYear: { month: number; dayOfMonth: number }[],
) {
  const { event: baselineEventAtBeginOfYear } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    getUTCBeginningOfCurrentYear(baseline),
    hour,
    minute,
    localeTimezone,
  )
  for (const dateOfYear of datesOfYear) {
    const { event } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
      addDays(addMonths(baselineEventAtBeginOfYear, dateOfYear.month), dateOfYear.dayOfMonth - 1),
      hour,
      minute,
      localeTimezone,
    )
    if (event > baseline && event.getUTCMonth() === dateOfYear.month) {
      yield event
    }
  }
}

export function* generateDailyRecurringEventInstances(
  hour: number,
  minute: number,
  baseline: Date,
  localeTimezone: string,
  periodEveryXDays: number,
) {
  const { event: baselineEvent } = calculateDSTAdjustedHourMinuteOffsetForTimezone(
    baseline,
    hour,
    minute,
    localeTimezone,
  )
  // Shift by 1 if daily event already happened earlier in day of recurrenceBaseline
  let offset = baselineEvent > baseline ? 0 : 1
  while (true) {
    yield addDSTAdjustedUTCDays(baselineEvent, offset, localeTimezone)
    offset += periodEveryXDays
  }
}

export function* generateWeeklySelectDaysRecurringEventInstances(
  hour: number,
  minute: number,
  daysOfWeek: number[],
  baseline: Date,
  localeTimezone: string,
  periodEveryXWeeks: number,
) {
  let currentWeekBaseline = baseline
  while (true) {
    yield* generateInstancesWithinWeekByDayOfWeek(currentWeekBaseline, localeTimezone, hour, minute, daysOfWeek)
    currentWeekBaseline = getUTCBeginningOfCurrentWeek(
      addDSTAdjustedUTCWeeks(currentWeekBaseline, periodEveryXWeeks, localeTimezone),
    )
  }
}

export function* generateMonthlySelectWeeksDaysRecurringEventInstances(
  hour: number,
  minute: number,
  weeksOfMonth: number[],
  daysOfWeek: number[],
  baseline: Date,
  localeTimezone: string,
  periodEveryXMonths: number,
) {
  let currentMonthBaseline = baseline
  yield* generateInstancesWithinMonthByWeekAndDay(
    currentMonthBaseline,
    localeTimezone,
    hour,
    minute,
    weeksOfMonth,
    daysOfWeek,
    false,
    true,
  )
  let weeksOfCurrentMonth = getWeeksInMonth(currentMonthBaseline)
  let generatedLastWeekOfPrevMonthInPrevCycle = periodEveryXMonths === 1 && weeksOfMonth.includes(weeksOfCurrentMonth)
  while (true) {
    currentMonthBaseline = getUTCBeginningOfCurrentMonth(
      addDSTAdjustedUTCMonths(currentMonthBaseline, periodEveryXMonths, localeTimezone),
    )
    yield* generateInstancesWithinMonthByWeekAndDay(
      currentMonthBaseline,
      localeTimezone,
      hour,
      minute,
      weeksOfMonth,
      daysOfWeek,
      true,
      generatedLastWeekOfPrevMonthInPrevCycle,
    )
    weeksOfCurrentMonth = getWeeksInMonth(currentMonthBaseline)
    generatedLastWeekOfPrevMonthInPrevCycle = periodEveryXMonths === 1 && weeksOfMonth.includes(weeksOfCurrentMonth)
  }
}

export function* generateMonthlySelectDaysRecurringEventInstances(
  hour: number,
  minute: number,
  daysOfMonth: number[],
  baseline: Date,
  localeTimezone: string,
  periodEveryXMonths: number,
) {
  let currentMonthBaseline = baseline
  while (true) {
    yield* generateInstancesWithinMonthByDate(currentMonthBaseline, localeTimezone, hour, minute, daysOfMonth)
    currentMonthBaseline = getUTCBeginningOfCurrentMonth(
      addDSTAdjustedUTCMonths(currentMonthBaseline, periodEveryXMonths, localeTimezone),
    )
  }
}

export function* generateYearlySelectMonthsWeeksDaysRecurringEventInstances(
  hour: number,
  minute: number,
  months: number[],
  weeksOfMonth: number[],
  daysOfWeek: number[],
  baseline: Date,
  localeTimezone: string,
  periodEveryXYears: number,
) {
  let currentYearBaseline = baseline
  yield* generateInstancesWithinYearByMonthWeekAndDay(
    currentYearBaseline,
    localeTimezone,
    hour,
    minute,
    months,
    weeksOfMonth,
    daysOfWeek,
    false,
    true,
  )
  let generatedLastWeekOfPrevYearInPrevCycle =
    periodEveryXYears === 1 &&
    months.includes(11) &&
    weeksOfMonth.includes(getWeeksInMonth(addDSTAdjustedUTCMonths(currentYearBaseline, 11, localeTimezone)))
  while (true) {
    currentYearBaseline = getUTCBeginningOfCurrentYear(
      addDSTAdjustedUTCYears(currentYearBaseline, periodEveryXYears, localeTimezone),
    )
    yield* generateInstancesWithinYearByMonthWeekAndDay(
      currentYearBaseline,
      localeTimezone,
      hour,
      minute,
      months,
      weeksOfMonth,
      daysOfWeek,
      true,
      generatedLastWeekOfPrevYearInPrevCycle,
    )
    generatedLastWeekOfPrevYearInPrevCycle =
      periodEveryXYears === 1 &&
      months.includes(11) &&
      weeksOfMonth.includes(getWeeksInMonth(addDSTAdjustedUTCMonths(currentYearBaseline, 11, localeTimezone)))
  }
}

export function* generateYearlySelectWeeksDaysRecurringEventInstances(
  hour: number,
  minute: number,
  weeksOfYear: number[],
  daysOfWeek: number[],
  baseline: Date,
  localeTimezone: string,
  periodEveryXYears: number,
) {
  let currentYearBaseline = baseline
  yield* generateInstancesWithinYearByWeekAndDay(
    currentYearBaseline,
    localeTimezone,
    hour,
    minute,
    weeksOfYear,
    daysOfWeek,
    false,
    true,
  )
  let weeksOfCurrentYear = getISOWeeksInYear(currentYearBaseline)
  let generatedLastWeekOfPrevYearInPrevCycle = periodEveryXYears === 1 && weeksOfYear.includes(weeksOfCurrentYear)
  while (true) {
    currentYearBaseline = getUTCBeginningOfCurrentYear(
      addDSTAdjustedUTCYears(currentYearBaseline, periodEveryXYears, localeTimezone),
    )
    yield* generateInstancesWithinYearByWeekAndDay(
      currentYearBaseline,
      localeTimezone,
      hour,
      minute,
      weeksOfYear,
      daysOfWeek,
      true,
      generatedLastWeekOfPrevYearInPrevCycle,
    )
    weeksOfCurrentYear = getWeeksInMonth(currentYearBaseline)
    generatedLastWeekOfPrevYearInPrevCycle = periodEveryXYears === 1 && weeksOfYear.includes(weeksOfCurrentYear)
  }
}

export function* generateYearlySelectDaysRecurringEventInstances(
  hour: number,
  minute: number,
  daysOfYear: { month: number; dayOfMonth: number }[],
  baseline: Date,
  localeTimezone: string,
  periodEveryXYears: number,
) {
  let currentYearBaseline = baseline
  while (true) {
    yield* generateInstancesWithinYearByDate(currentYearBaseline, localeTimezone, hour, minute, daysOfYear)
    currentYearBaseline = getUTCBeginningOfCurrentYear(
      addDSTAdjustedUTCYears(currentYearBaseline, periodEveryXYears, localeTimezone),
    )
  }
}
