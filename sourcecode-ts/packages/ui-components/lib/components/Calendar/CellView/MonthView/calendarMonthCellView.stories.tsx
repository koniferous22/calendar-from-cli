import type { Meta, StoryObj } from '@storybook/react'

import { zonedRangeInterval } from '@calendar-from-cli/calendar-utils'
import { CalendarMonthCellView } from './calendarMonthCellView'
import { commonTimestamps, timezone } from '../../../../storybook-utils/constants'
import { createCalendarViewCtx } from '../../../../storybook-utils/ctxOptions'
import { withCalendarView } from '../../../../storybook-utils/hoc'
import { addDays } from 'date-fns'

const meta: Meta<typeof CalendarMonthCellView> = {
  component: CalendarMonthCellView,
}

export default meta
type Story = StoryObj<typeof CalendarMonthCellView>

type Props = Parameters<typeof CalendarMonthCellView>[0]

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */

const createExampleTimestampByDayOfWeek = (now: Date, dayOfWeek: number, hours: number, minutes: number) => {
  const weekBegin = zonedRangeInterval.createZonedWeekInterval(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    timezone,
  )[0]
  const dayOfWeekBegin = addDays(weekBegin, dayOfWeek)
  dayOfWeekBegin.setHours(hours, minutes)
  return dayOfWeekBegin
}

const calendarCtxOptions = createCalendarViewCtx({
  rangeViewType: 'monthCellView',
  now: commonTimestamps.now,
  timezones: {
    ownerTimezone: timezone,
    clientTimezone: timezone,
    initialTimezoneView: {
      type: 'ownerTimezone',
    },
  },
})

const events: Props['events'] = [
  {
    title: 'Example Event 1',
    // indexInCell: 0,
    startsAt: createExampleTimestampByDayOfWeek(commonTimestamps.now, 0, 13, 0),
    endsAt: createExampleTimestampByDayOfWeek(commonTimestamps.now, 1, 13, 0),
    eventInfo: {
      type: 'basic',
      description: 'Example Description',
      descriptionFormat: 'Plaintext',
    },
    eventTag: {
      alias: 'event tag',
      color: '#ffffff',
    },
    isConcealed: false,
    duration: 50,
  },
  {
    title: 'Example Event 2',
    startsAt: createExampleTimestampByDayOfWeek(commonTimestamps.now, 0, 13, 0),
    endsAt: createExampleTimestampByDayOfWeek(commonTimestamps.now, 1, 13, 0),
    // indexInCell: 1,
    eventInfo: {
      type: 'basic',
      description: 'Example Description',
      descriptionFormat: 'Plaintext',
    },
    eventTag: null,
    isConcealed: false,
    duration: 50,
  },
  {
    title: 'Example Event 3',
    startsAt: createExampleTimestampByDayOfWeek(commonTimestamps.now, 1, 13, 0),
    endsAt: createExampleTimestampByDayOfWeek(commonTimestamps.now, 3, 13, 0),
    // indexInCell: 2,
    eventInfo: {
      type: 'basic',
      description: 'Example Description',
      descriptionFormat: 'Plaintext',
    },
    eventTag: null,
    isConcealed: false,
    duration: 50,
  },
  {
    title: 'Example Event 4',
    startsAt: createExampleTimestampByDayOfWeek(commonTimestamps.now, 1, 13, 0),
    endsAt: createExampleTimestampByDayOfWeek(commonTimestamps.now, 4, 13, 0),
    // indexInCell: 3,
    eventInfo: {
      type: 'basic',
      description: 'Example Description',
      descriptionFormat: 'Plaintext',
    },
    eventTag: {
      alias: 'event tag',
      color: '#ffffff',
    },
    isConcealed: false,
    duration: 50,
  },
  {
    title: 'Example Event 5',
    startsAt: createExampleTimestampByDayOfWeek(commonTimestamps.now, 2, 13, 0),
    endsAt: createExampleTimestampByDayOfWeek(commonTimestamps.now, 2, 14, 0),
    eventInfo: {
      type: 'basic',
      description: 'Example Description',
      descriptionFormat: 'Plaintext',
    },
    eventTag: null,
    isConcealed: false,
    duration: 50,
  },
]

export const Primary: Story = {
  args: {
    identifier: {
      year: calendarCtxOptions.initialState.rangeView.identifier.year,
      month: calendarCtxOptions.initialState.rangeView.identifier.month,
    },
    events,
    renderingOptions: {
      minCalendarEventHeightPx: 30,
      minimumDayCellCapacity: 3,
    },
  },
  render: withCalendarView(calendarCtxOptions, (props: Props) => <CalendarMonthCellView {...props} />),
}
