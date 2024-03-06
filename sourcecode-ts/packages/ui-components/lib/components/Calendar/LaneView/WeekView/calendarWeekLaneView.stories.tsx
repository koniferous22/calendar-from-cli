import type { Meta, StoryObj } from '@storybook/react'

import { CalendarWeekLaneView } from './calendarWeekLaneView'
import { commonTimestamps, timezone } from '../../../../storybook-utils/constants'
import { createDateWithDifferentTimeOfDay } from '../../../../storybook-utils/date'
import { buildBasicEvent } from '../../../../storybook-utils/fixtures/event'
import { createCalendarViewCtx } from '../../../../storybook-utils/ctxOptions'
import { withCalendarView, withLoader } from '../../../../storybook-utils/hoc'
import { calendarRangeIdentifier } from '@calendar-from-cli/calendar-utils'

const meta: Meta<typeof CalendarWeekLaneView> = {
  component: CalendarWeekLaneView,
}

export default meta
type Story = StoryObj<typeof CalendarWeekLaneView>

type Props = Parameters<typeof CalendarWeekLaneView>[0]

const renderedNow = createDateWithDifferentTimeOfDay(commonTimestamps.today, 9, 1)

const yesterdayEventOpts = {
  title: 'Yesterday Event asdf asdf asdf asdf asdf asdf asdf asdf asdf asdfasfdasdfasdfasdfasdf',
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

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */

const calendarViewCtx = createCalendarViewCtx({
  now: renderedNow,
  rangeViewType: 'weekLaneView',
  timezones: {
    ownerTimezone: timezone,
    clientTimezone: timezone,
    initialTimezoneView: {
      type: 'ownerTimezone',
    },
  },
})

export const WeekOverlappingEvents: Story = {
  args: {
    identifier: calendarRangeIdentifier.calendarRangeIdentifierFromDate(renderedNow, 'weekLaneView').identifier,
    events: [buildBasicEvent(yesterdayEventOpts), buildBasicEvent(tomorrowEventOpts)],
    renderingOptions: {
      eventSizeResolution: 'duration',
      itemBreakpointsInMinutes: {
        minLengthForDisplayDuration: 50,
        minLengthForDisplayTitle: 25,
      },
    },
    navigation: {
      goToDay: {
        type: 'button',
        onClick: () => {},
      },
    },
  },
  render: withLoader(
    {
      isLoading: false,
      shouldDisplayLoaderOverlay: true,
    },
    withCalendarView(calendarViewCtx, (props: Props) => <CalendarWeekLaneView {...props} />),
  ),
}

export const Loading: Story = {
  ...WeekOverlappingEvents,
  render: withLoader(
    {
      isLoading: true,
      shouldDisplayLoaderOverlay: false,
    },
    withCalendarView(calendarViewCtx, (props: Props) => <CalendarWeekLaneView {...props} />),
  ),
}

export const WeekMultiDayOverlappingEvent: Story = {
  ...WeekOverlappingEvents,
  args: {
    ...WeekOverlappingEvents.args,
    events: [buildBasicEvent(overlappingEventOpts)],
  },
}
