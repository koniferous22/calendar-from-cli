import { describe, expect, test } from '@jest/globals'
import {
  generateDailyRecurringEventInstances,
  generateMonthlySelectDaysRecurringEventInstances,
  generateMonthlySelectWeeksDaysRecurringEventInstances,
  generateWeeklySelectDaysRecurringEventInstances,
  generateYearlySelectDaysRecurringEventInstances,
  generateYearlySelectMonthsWeeksDaysRecurringEventInstances,
  generateYearlySelectWeeksDaysRecurringEventInstances,
} from '../src/recurring-event-instances/generators'

const generatorTest = (testMsg: string, g: Generator<Date, void, unknown>, expectedOutputs: Date[]) => {
  test(testMsg, () => {
    for (const expectedOutput of expectedOutputs) {
      const generatorResult = g.next()
      expect(generatorResult.done).toBe(false)
      const actualOutput = generatorResult.value
      expect(actualOutput).toEqual(expectedOutput)
    }
  })
}

const timezone = 'Europe/Prague'

// Note DST occurs on 31.3.2024

describe('Recurring Event Instance Generator tests', () => {
  generatorTest(
    'Generator of daily recurring events',
    generateDailyRecurringEventInstances(17, 30, new Date('2024-03-01T00:00:00.000Z'), timezone, 1),
    [
      new Date('2024-03-01T16:30:00.000Z'),
      new Date('2024-03-02T16:30:00.000Z'),
      new Date('2024-03-03T16:30:00.000Z'),
      new Date('2024-03-04T16:30:00.000Z'),
      new Date('2024-03-05T16:30:00.000Z'),
      new Date('2024-03-06T16:30:00.000Z'),
      new Date('2024-03-07T16:30:00.000Z'),
      new Date('2024-03-08T16:30:00.000Z'),
      new Date('2024-03-09T16:30:00.000Z'),
      new Date('2024-03-10T16:30:00.000Z'),
    ],
  )
  generatorTest(
    'Generator of daily recurring events with period 2',
    generateDailyRecurringEventInstances(17, 30, new Date('2024-03-01T00:00:00.000Z'), timezone, 2),
    [
      new Date('2024-03-01T16:30:00.000Z'),
      new Date('2024-03-03T16:30:00.000Z'),
      new Date('2024-03-05T16:30:00.000Z'),
      new Date('2024-03-07T16:30:00.000Z'),
      new Date('2024-03-09T16:30:00.000Z'),
      new Date('2024-03-11T16:30:00.000Z'),
      new Date('2024-03-13T16:30:00.000Z'),
      new Date('2024-03-15T16:30:00.000Z'),
      new Date('2024-03-17T16:30:00.000Z'),
      new Date('2024-03-19T16:30:00.000Z'),
    ],
  )
  generatorTest(
    'Generator of weekly recurring events',
    generateWeeklySelectDaysRecurringEventInstances(
      17,
      30,
      [0, 2, 5],
      new Date('2024-03-01T00:00:00.000Z'),
      timezone,
      1,
    ),
    [
      new Date('2024-03-01T16:30:00.000Z'),
      new Date('2024-03-03T16:30:00.000Z'),
      new Date('2024-03-05T16:30:00.000Z'),
      new Date('2024-03-08T16:30:00.000Z'),
      new Date('2024-03-10T16:30:00.000Z'),
      new Date('2024-03-12T16:30:00.000Z'),
      new Date('2024-03-15T16:30:00.000Z'),
      new Date('2024-03-17T16:30:00.000Z'),
      new Date('2024-03-19T16:30:00.000Z'),
      new Date('2024-03-22T16:30:00.000Z'),
    ],
  )
  generatorTest(
    'Generator of weekly recurring events with period 2',
    generateWeeklySelectDaysRecurringEventInstances(
      17,
      30,
      [0, 2, 5],
      new Date('2024-03-01T00:00:00.000Z'),
      timezone,
      2,
    ),
    [
      new Date('2024-03-01T16:30:00.000Z'),
      new Date('2024-03-10T16:30:00.000Z'),
      new Date('2024-03-12T16:30:00.000Z'),
      new Date('2024-03-15T16:30:00.000Z'),
      new Date('2024-03-24T16:30:00.000Z'),
      new Date('2024-03-26T16:30:00.000Z'),
      new Date('2024-03-29T16:30:00.000Z'),
      // DST occurs here
      new Date('2024-04-07T15:30:00.000Z'),
      new Date('2024-04-09T15:30:00.000Z'),
      new Date('2024-04-12T15:30:00.000Z'),
    ],
  )
  generatorTest(
    'Generator of monthly events specified by days',
    generateMonthlySelectDaysRecurringEventInstances(
      17,
      30,
      [11, 17, 23, 29, 31],
      new Date('2024-03-01T00:00:00.000Z'),
      timezone,
      1,
    ),
    [
      new Date('2024-03-11T16:30:00.000Z'),
      new Date('2024-03-17T16:30:00.000Z'),
      new Date('2024-03-23T16:30:00.000Z'),
      new Date('2024-03-29T16:30:00.000Z'),
      // DST occurs here
      new Date('2024-03-31T15:30:00.000Z'),
      new Date('2024-04-11T15:30:00.000Z'),
      new Date('2024-04-17T15:30:00.000Z'),
      new Date('2024-04-23T15:30:00.000Z'),
      new Date('2024-04-29T15:30:00.000Z'),
      new Date('2024-05-11T15:30:00.000Z'),
    ],
  )
  generatorTest(
    'Generator of monthly events specified by days with period 2',
    generateMonthlySelectDaysRecurringEventInstances(
      17,
      30,
      [11, 17, 23, 29, 31],
      new Date('2024-03-01T00:00:00.000Z'),
      timezone,
      2,
    ),
    [
      new Date('2024-03-11T16:30:00.000Z'),
      new Date('2024-03-17T16:30:00.000Z'),
      new Date('2024-03-23T16:30:00.000Z'),
      new Date('2024-03-29T16:30:00.000Z'),
      new Date('2024-03-31T15:30:00.000Z'),
      new Date('2024-05-11T15:30:00.000Z'),
      new Date('2024-05-17T15:30:00.000Z'),
      new Date('2024-05-23T15:30:00.000Z'),
      new Date('2024-05-29T15:30:00.000Z'),
      new Date('2024-05-31T15:30:00.000Z'),
    ],
  )
  generatorTest(
    'Generator of monthly events specified by weeks of month and days',
    generateMonthlySelectWeeksDaysRecurringEventInstances(
      17,
      30,
      [1, 3, 5],
      [1, 2, 4],
      new Date('2024-03-01T00:00:00.000Z'),
      timezone,
      1,
    ),
    [
      new Date('2024-03-11T16:30:00.000Z'),
      new Date('2024-03-12T16:30:00.000Z'),
      new Date('2024-03-14T16:30:00.000Z'),
      new Date('2024-03-25T16:30:00.000Z'),
      new Date('2024-03-26T16:30:00.000Z'),
      new Date('2024-03-28T16:30:00.000Z'),
      new Date('2024-04-01T15:30:00.000Z'),
      new Date('2024-04-02T15:30:00.000Z'),
      new Date('2024-04-04T15:30:00.000Z'),
      new Date('2024-04-15T15:30:00.000Z'),
      new Date('2024-04-16T15:30:00.000Z'),
      new Date('2024-04-18T15:30:00.000Z'),
      new Date('2024-04-29T15:30:00.000Z'),
      new Date('2024-04-30T15:30:00.000Z'),
      new Date('2024-05-02T15:30:00.000Z'),
      new Date('2024-05-13T15:30:00.000Z'),
    ],
  )
  generatorTest(
    'Generator of monthly events specified by weeks of month and days with period 2',
    generateMonthlySelectWeeksDaysRecurringEventInstances(
      17,
      30,
      [1, 3, 5],
      [1, 2, 4],
      new Date('2024-03-01T00:00:00.000Z'),
      timezone,
      2,
    ),
    [
      new Date('2024-03-11T16:30:00.000Z'),
      new Date('2024-03-12T16:30:00.000Z'),
      new Date('2024-03-14T16:30:00.000Z'),
      new Date('2024-03-25T16:30:00.000Z'),
      new Date('2024-03-26T16:30:00.000Z'),
      new Date('2024-03-28T16:30:00.000Z'),
      new Date('2024-04-29T15:30:00.000Z'),
      new Date('2024-04-30T15:30:00.000Z'),
      new Date('2024-05-02T15:30:00.000Z'),
      new Date('2024-05-13T15:30:00.000Z'),
      new Date('2024-05-14T15:30:00.000Z'),
      new Date('2024-05-16T15:30:00.000Z'),
    ],
  )
  generatorTest(
    'Generator of yearly events specified by months, weeks and days',
    generateYearlySelectMonthsWeeksDaysRecurringEventInstances(
      17,
      30,
      [0, 11],
      [1, 3, 5],
      [1, 2, 5],
      new Date('2024-03-01T00:00:00.000Z'),
      timezone,
      1,
    ),
    [
      new Date('2024-12-02T16:30:00.000Z'),
      new Date('2024-12-03T16:30:00.000Z'),
      new Date('2024-12-06T16:30:00.000Z'),
      new Date('2024-12-16T16:30:00.000Z'),
      new Date('2024-12-17T16:30:00.000Z'),
      new Date('2024-12-20T16:30:00.000Z'),
      new Date('2024-12-30T16:30:00.000Z'),
      new Date('2024-12-31T16:30:00.000Z'),
      new Date('2025-01-03T16:30:00.000Z'),
      new Date('2025-01-13T16:30:00.000Z'),
      new Date('2025-01-14T16:30:00.000Z'),
      new Date('2025-01-17T16:30:00.000Z'),
      new Date('2025-01-27T16:30:00.000Z'),
      new Date('2025-01-28T16:30:00.000Z'),
      new Date('2025-01-31T16:30:00.000Z'),
      new Date('2025-12-01T16:30:00.000Z'),
      new Date('2025-12-02T16:30:00.000Z'),
      new Date('2025-12-05T16:30:00.000Z'),
    ],
  )
  generatorTest(
    'Generator of yearly events specified by months, weeks and days with period 2',
    generateYearlySelectMonthsWeeksDaysRecurringEventInstances(
      17,
      30,
      [0, 11],
      [1, 3, 5],
      [1, 2, 5],
      new Date('2024-03-01T00:00:00.000Z'),
      timezone,
      2,
    ),
    [
      new Date('2024-12-02T16:30:00.000Z'),
      new Date('2024-12-03T16:30:00.000Z'),
      new Date('2024-12-06T16:30:00.000Z'),
      new Date('2024-12-16T16:30:00.000Z'),
      new Date('2024-12-17T16:30:00.000Z'),
      new Date('2024-12-20T16:30:00.000Z'),
      new Date('2024-12-30T16:30:00.000Z'),
      new Date('2024-12-31T16:30:00.000Z'),
      new Date('2025-01-03T16:30:00.000Z'),
      new Date('2025-12-29T16:30:00.000Z'),
      new Date('2025-12-30T16:30:00.000Z'),
      new Date('2026-01-02T16:30:00.000Z'),
      new Date('2026-01-12T16:30:00.000Z'),
      new Date('2026-01-13T16:30:00.000Z'),
      new Date('2026-01-16T16:30:00.000Z'),
    ],
  )
  generatorTest(
    'Generator of yearly events specified by weeks and days',
    generateYearlySelectWeeksDaysRecurringEventInstances(
      17,
      30,
      [1, 3, 5, 52, 53],
      [1, 2, 3, 4, 5],
      new Date('2024-03-01T00:00:00.000Z'),
      timezone,
      1,
    ),
    [
      new Date('2024-12-23T16:30:00.000Z'),
      new Date('2024-12-24T16:30:00.000Z'),
      new Date('2024-12-25T16:30:00.000Z'),
      new Date('2024-12-26T16:30:00.000Z'),
      new Date('2024-12-27T16:30:00.000Z'),
      new Date('2024-12-30T16:30:00.000Z'),
      new Date('2024-12-31T16:30:00.000Z'),
      new Date('2025-01-01T16:30:00.000Z'),
      new Date('2025-01-02T16:30:00.000Z'),
      new Date('2025-01-03T16:30:00.000Z'),
      new Date('2025-01-13T16:30:00.000Z'),
      new Date('2025-01-14T16:30:00.000Z'),
      new Date('2025-01-15T16:30:00.000Z'),
      new Date('2025-01-16T16:30:00.000Z'),
      new Date('2025-01-17T16:30:00.000Z'),
    ],
  )
  // // Note - 2026 has 53 should have 53 weeks
  generatorTest(
    'Generator of yearly events specified by weeks and days with period 2',
    generateYearlySelectWeeksDaysRecurringEventInstances(
      17,
      30,
      [1, 3, 5, 52, 53],
      [1, 2, 3, 4, 5],
      new Date('2024-03-01T00:00:00.000Z'),
      timezone,
      2,
    ),
    [
      new Date('2024-12-23T16:30:00.000Z'),
      new Date('2024-12-24T16:30:00.000Z'),
      new Date('2024-12-25T16:30:00.000Z'),
      new Date('2024-12-26T16:30:00.000Z'),
      new Date('2024-12-27T16:30:00.000Z'),
      new Date('2024-12-30T16:30:00.000Z'),
      new Date('2024-12-31T16:30:00.000Z'),
      new Date('2025-01-01T16:30:00.000Z'),
      new Date('2025-01-02T16:30:00.000Z'),
      new Date('2025-01-03T16:30:00.000Z'),
      new Date('2025-12-29T16:30:00.000Z'),
      new Date('2025-12-30T16:30:00.000Z'),
      new Date('2025-12-31T16:30:00.000Z'),
      new Date('2026-01-01T16:30:00.000Z'),
      new Date('2026-01-02T16:30:00.000Z'),
      new Date('2026-01-12T16:30:00.000Z'),
      new Date('2026-01-13T16:30:00.000Z'),
      new Date('2026-01-14T16:30:00.000Z'),
      new Date('2026-01-15T16:30:00.000Z'),
      new Date('2026-01-16T16:30:00.000Z'),
      new Date('2026-01-26T16:30:00.000Z'),
      new Date('2026-01-27T16:30:00.000Z'),
      new Date('2026-01-28T16:30:00.000Z'),
      new Date('2026-01-29T16:30:00.000Z'),
      new Date('2026-01-30T16:30:00.000Z'),
      new Date('2026-12-21T16:30:00.000Z'),
      new Date('2026-12-22T16:30:00.000Z'),
      new Date('2026-12-23T16:30:00.000Z'),
      new Date('2026-12-24T16:30:00.000Z'),
      new Date('2026-12-25T16:30:00.000Z'),
      new Date('2026-12-28T16:30:00.000Z'),
      new Date('2026-12-29T16:30:00.000Z'),
      new Date('2026-12-30T16:30:00.000Z'),
      new Date('2026-12-31T16:30:00.000Z'),
      new Date('2027-01-01T16:30:00.000Z'),
    ],
  )
  generatorTest(
    'Generator of yearly events specified by dates',
    generateYearlySelectDaysRecurringEventInstances(
      17,
      30,
      [{ month: 1, dayOfMonth: 29 }],
      new Date('2024-03-01T00:00:00.000Z'),
      timezone,
      1,
    ),
    [new Date('2028-02-29T16:30:00.000Z'), new Date('2032-02-29T16:30:00.000Z'), new Date('2036-02-29T16:30:00.000Z')],
  )
})
