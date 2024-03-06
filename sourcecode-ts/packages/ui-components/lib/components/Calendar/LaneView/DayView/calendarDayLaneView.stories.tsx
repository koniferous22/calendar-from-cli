import type { Meta, StoryObj } from '@storybook/react'

import { CalendarDayLaneView } from './calendarDayLaneView'
import { commonTimestamps, timezone } from '../../../../storybook-utils/constants'
import { withCalendarView, withLoader } from '../../../../storybook-utils/hoc'
import { createCalendarViewCtx } from '../../../../storybook-utils/ctxOptions'
import { createDateWithDifferentTimeOfDay } from '../../../../storybook-utils/date'
import { buildBasicEvent } from '../../../../storybook-utils/fixtures/event'
import { calendarRangeIdentifier } from '@calendar-from-cli/calendar-utils'

const meta: Meta<typeof CalendarDayLaneView> = {
  component: CalendarDayLaneView,
}

export default meta
type Story = StoryObj<typeof CalendarDayLaneView>

const renderedNow = createDateWithDifferentTimeOfDay(commonTimestamps.today, 9, 1)

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */

const event1Opts = {
  title: 'Example Event 1',
  startsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 8, 0),
  endsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 9, 0),
}

const event2Opts = {
  title: 'Example Event 2',
  startsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 9, 0),
  endsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 9, 30),
}

const event3Opts = {
  title: 'Example Event 3',
  startsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 12, 45),
  endsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 15, 0),
}

const event4Opts = {
  title: 'Example Event 4',
  startsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 13, 30),
  endsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 15, 5),
}

const yesterdayEventOpts = {
  title: 'Yesterday Event',
  startsAt: createDateWithDifferentTimeOfDay(commonTimestamps.yesterday, 13, 30),
  endsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 8, 0),
}

const tomorrowEventOpts = {
  title: 'Tomorrow Event',
  startsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 18, 30),
  endsAt: createDateWithDifferentTimeOfDay(commonTimestamps.tomorrow, 8, 0),
}

const overlappingEventOpts = {
  title: 'Overlapping Event',
  startsAt: createDateWithDifferentTimeOfDay(commonTimestamps.yesterday, 18, 30),
  endsAt: createDateWithDifferentTimeOfDay(commonTimestamps.tomorrow, 8, 0),
}

const outOfBoundsEvent = {
  title: 'Out of bounds Event',
  startsAt: createDateWithDifferentTimeOfDay(commonTimestamps.yesterday, 12, 30),
  endsAt: createDateWithDifferentTimeOfDay(commonTimestamps.yesterday, 16, 0),
}

const complexConflict1Event1 = {
  title: 'Conflict Event 1',
  startsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 8, 0),
  endsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 9, 0),
}
const complexConflict1Event2 = {
  title: 'Conflict Event 2',
  startsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 9, 0),
  endsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 11, 0),
}

const complexConflict1Event3 = {
  title: 'Conflict Event 3',
  startsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 9, 0),
  endsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 12, 0),
}

const complexConflict1Event4 = {
  title: 'Conflict Event 4',
  startsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 9, 0),
  endsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 14, 0),
}

const complexConflict1Event5 = {
  title: 'Conflict Event 5',
  startsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 13, 0),
  endsAt: createDateWithDifferentTimeOfDay(commonTimestamps.today, 15, 0),
}

const calendarViewCtx = createCalendarViewCtx({
  rangeViewType: 'dayLaneView',
  now: renderedNow,
  timezones: {
    ownerTimezone: timezone,
    clientTimezone: timezone,
    initialTimezoneView: {
      type: 'ownerTimezone',
    },
  },
})

export const ExampleDay: Story = {
  args: {
    identifier: calendarRangeIdentifier.calendarRangeIdentifierFromDate(renderedNow, 'dayLaneView').identifier,
    dayOfWeek: renderedNow.getDay(),
    now: renderedNow,
    events: [buildBasicEvent(event1Opts), buildBasicEvent(event3Opts)],
    renderingOptions: {
      eventSizeResolution: 'duration',
      itemBreakpointsInMinutes: {
        minLengthForDisplayDuration: 50,
        minLengthForDisplayTitle: 25,
      },
    },
  },
  render: withLoader(
    {
      isLoading: false,
      shouldDisplayLoaderOverlay: true,
    },
    withCalendarView(calendarViewCtx, CalendarDayLaneView),
  ),
}

export const Loading: Story = {
  ...ExampleDay,
  render: withLoader(
    {
      isLoading: true,
      shouldDisplayLoaderOverlay: false,
    },
    withCalendarView(calendarViewCtx, CalendarDayLaneView),
  ),
}

export const BlurredPast: Story = {
  ...ExampleDay,
  args: {
    ...ExampleDay.args,
    events: [
      buildBasicEvent({
        ...event1Opts,
        isConcealed: true,
      }),
      buildBasicEvent(event2Opts),
      buildBasicEvent(event3Opts),
    ],
  },
}

export const SimpleConflict: Story = {
  ...ExampleDay,
  args: {
    ...ExampleDay.args,
    events: [buildBasicEvent(event2Opts), buildBasicEvent(event3Opts), buildBasicEvent(event4Opts)],
  },
}

export const EventFromYesterday: Story = {
  ...ExampleDay,
  args: {
    ...ExampleDay.args,
    events: [buildBasicEvent(yesterdayEventOpts)],
  },
}

export const EventEndingTomorrow: Story = {
  ...ExampleDay,
  args: {
    ...ExampleDay.args,
    events: [buildBasicEvent(tomorrowEventOpts)],
  },
}

export const OverlappingEvent: Story = {
  ...ExampleDay,
  args: {
    ...ExampleDay.args,
    events: [buildBasicEvent(overlappingEventOpts)],
  },
}

export const OutOfBoundEvent: Story = {
  ...ExampleDay,
  args: {
    ...ExampleDay.args,
    events: [buildBasicEvent(outOfBoundsEvent)],
  },
}

export const ComplextConflicts: Story = {
  ...ExampleDay,
  args: {
    ...ExampleDay.args,
    events: [
      complexConflict1Event1,
      complexConflict1Event2,
      complexConflict1Event3,
      complexConflict1Event4,
      complexConflict1Event5,
    ].map(buildBasicEvent),
  },
}
