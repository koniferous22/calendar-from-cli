import { describe, expect, test } from '@jest/globals'
import {
  calculateDSTAdjustedHourMinuteOffsetForTimezone,
  calculateDSTAdjustedTimeOffsetInDays,
  calculateDSTIntroducedOffset,
  addDSTAdjustedUTCDays,
} from '../src/date/dst'

const timezone = 'Europe/Prague'

describe('DST tests', () => {
  test('Calculating DST Introduced Offset', () => {
    // ┌─────────────────────────────────────────────────────────────────────┐
    // │                                                                     │
    // │ 31.3.2024 - DST at 2am (Europe/Prague), clock shifts 1 hour forward │
    // │                                                                     │
    // └─────────────────────────────────────────────────────────────────────┘
    // Zoned midnight of 30.3.2024
    const dst24change1Before = new Date('2024-03-30T23:00:00.000Z')
    // Zoned midnight of 31.3.2024
    const dst24change1After = new Date('2024-03-31T23:00:00.000Z')
    // DST introduced offset 3600000 = 1 hour
    expect(calculateDSTIntroducedOffset(dst24change1Before, dst24change1After, timezone)).toEqual(3600000)
    // ┌───────────────────────────────────────────────────────────────────────┐
    // │                                                                       │
    // │ 27.10.2024 - DST at 2am (Europe/Prague), clock shifts 1 hour backward │
    // │                                                                       │
    // └───────────────────────────────────────────────────────────────────────┘
    // Zoned midnight of 26.10.2024
    const dst24change2Before = new Date('2024-10-26T23:00:00.000Z')
    // Zoned midnight of 27.10.2024
    const dst24change2After = new Date('2024-10-27T23:00:00.000Z')
    expect(calculateDSTIntroducedOffset(dst24change2Before, dst24change2After, timezone)).toEqual(-3600000)
    // ┌────────────────────────────┐
    // │                            │
    // │ 30.3.2024 - Day before DST │
    // │                            │
    // └────────────────────────────┘
    // Day before DST - should result in 0
    const dayBeforeDst24Change1Before = new Date('2024-03-29T23:00:00.000Z')
    const dayBeforeDst24Change1After = new Date('2024-03-30T23:00:00.000Z')
    expect(calculateDSTIntroducedOffset(dayBeforeDst24Change1Before, dayBeforeDst24Change1After, timezone)).toEqual(0)
  })
  test('Calculating DST Adjusted Hour-minute offset', () => {
    // NOTE - before doing anything else, function searches for beginning of current UTC day
    // ┌────────────────────────────┐
    // │                            │
    // │ 30.3.2024 - Day before DST │
    // │                            │
    // └────────────────────────────┘
    // Expected offset 0, event at 1am is UTC midnight + no DST offset
    const result1 = calculateDSTAdjustedHourMinuteOffsetForTimezone(
      new Date('2024-03-30T01:00:00.000Z'),
      1,
      0,
      timezone,
    )
    expect(result1.eventOffset).toEqual(0)
    expect(result1.event).toEqual(new Date('2024-03-30T00:00:00.000Z'))
    // Expected offset 3 hours, event at 4am is 3am UTC midnight + no DST offset
    const result2 = calculateDSTAdjustedHourMinuteOffsetForTimezone(
      new Date('2024-03-30T01:00:00.000Z'),
      4,
      0,
      timezone,
    )
    expect(result2.eventOffset).toEqual(3 * 60 * 60 * 1000)
    expect(result2.event).toEqual(new Date('2024-03-30T03:00:00.000Z'))
    // ┌─────────────────────────────────────────────────────────────────────┐
    // │                                                                     │
    // │ 31.3.2024 - DST at 2am (Europe/Prague), clock shifts 1 hour forward │
    // │                                                                     │
    // └─────────────────────────────────────────────────────────────────────┘
    // Expected offset 0, event at 1am is still UTC midnight, as DST occurs at 2am (Europe/Prague)
    const result3 = calculateDSTAdjustedHourMinuteOffsetForTimezone(
      new Date('2024-03-31T01:00:00.000Z'),
      1,
      0,
      timezone,
    )
    expect(result3.eventOffset).toEqual(0)
    expect(result3.event).toEqual(new Date('2024-03-31T00:00:00.000Z'))
    // Expected offset 2 hours, event at 4am is 2am UTC midnight , because of DST at 2am (Europe/Prague)
    const result4 = calculateDSTAdjustedHourMinuteOffsetForTimezone(
      new Date('2024-03-31T01:00:00.000Z'),
      4,
      0,
      timezone,
    )
    expect(result4.eventOffset).toEqual(2 * 60 * 60 * 1000)
    expect(result4.event).toEqual(new Date('2024-03-31T02:00:00.000Z'))
    // ┌─────────────────────────────┐
    // │                             │
    // │ 26.10.2024 - Day before DST │
    // │                             │
    // └─────────────────────────────┘
    // Expected offset 0, event at 1am is 11pm previous day + no DST offset
    const result5 = calculateDSTAdjustedHourMinuteOffsetForTimezone(
      new Date('2024-10-26T01:00:00.000Z'),
      1,
      0,
      timezone,
    )
    expect(result5.eventOffset).toEqual(-1 * 60 * 60 * 1000)
    expect(result5.event).toEqual(new Date('2024-10-25T23:00:00.000Z'))
    // Expected offset 2 hours, event at 4am is 2am UTC midnight + no DST offset
    const result6 = calculateDSTAdjustedHourMinuteOffsetForTimezone(
      new Date('2024-10-26T01:00:00.000Z'),
      4,
      0,
      timezone,
    )
    expect(result6.eventOffset).toEqual(2 * 60 * 60 * 1000)
    expect(result6.event).toEqual(new Date('2024-10-26T02:00:00.000Z'))
    // ┌───────────────────────────────────────────────────────────────────────┐
    // │                                                                       │
    // │ 27.10.2024 - DST at 2am (Europe/Prague), clock shifts 1 hour backward │
    // │                                                                       │
    // └───────────────────────────────────────────────────────────────────────┘
    // Expected offset 0, event at 1am is still UTC midnight, as DST occurs at 2am (Europe/Prague)
    const result7 = calculateDSTAdjustedHourMinuteOffsetForTimezone(
      new Date('2024-10-27T01:00:00.000Z'),
      1,
      0,
      timezone,
    )
    expect(result7.eventOffset).toEqual(-1 * 60 * 60 * 1000)
    expect(result7.event).toEqual(new Date('2024-10-26T23:00:00.000Z'))
    // Expected offset 3 hours, event at 4am is 3am UTC midnight, because of DST at 2am (Europe/Prague)
    const result8 = calculateDSTAdjustedHourMinuteOffsetForTimezone(
      new Date('2024-10-27T01:00:00.000Z'),
      4,
      0,
      timezone,
    )
    expect(result8.eventOffset).toEqual(3 * 60 * 60 * 1000)
    expect(result8.event).toEqual(new Date('2024-10-27T03:00:00.000Z'))
  })
  test('Calculating DST Adjusted Offset In Days', () => {
    const dst24changeBefore = new Date('2024-03-30T23:00:00.000Z')
    const dst24changeAfter1 = new Date('2024-03-31T23:00:00.000Z')
    const actual0 = calculateDSTAdjustedTimeOffsetInDays(dst24changeBefore, dst24changeAfter1, timezone)
    expect(actual0.days).toEqual(0)
    expect(actual0.isExact).toEqual(false)
    expect(actual0.remainder).toBeGreaterThan(0)
    const dst24changeAfter2 = new Date('2024-04-01T00:00:00.000Z')
    const actual1 = calculateDSTAdjustedTimeOffsetInDays(dst24changeBefore, dst24changeAfter2, timezone)
    expect(actual1.days).toEqual(1)
    expect(actual1.isExact).toEqual(true)
    expect(actual1.remainder).toEqual(0)
  })

  test('DST Adjusted UTC Day Addition', () => {
    const input = new Date('2024-03-30T23:00:00.000Z')
    const expectedResultDstAdjustedUTC = new Date('2024-04-02T23:00:00.000Z')
    const resultsDstAdjustedUTC = addDSTAdjustedUTCDays(input, 3, timezone)
    expect(resultsDstAdjustedUTC).toEqual(expectedResultDstAdjustedUTC)
    // Experimental 'localized' part of the test
    // * can produce non-deterministic results
    // const expectedResultZoned = new Date('2024-04-02T22:00:00.000Z')
    // const resultZoned = addDays(input, 3)
    // expect(resultZoned).toEqual(expectedResultZoned)
  })
})
