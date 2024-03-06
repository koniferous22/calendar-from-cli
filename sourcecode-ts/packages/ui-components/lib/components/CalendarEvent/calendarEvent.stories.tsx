import type { Meta, StoryObj } from '@storybook/react'

import { CalendarEvent } from './calendarEvent'
import { CalendarEventProvider } from '../../context/calendarEvent'
import { eventFmt } from '@calendar-from-cli/calendar-utils'
import { createCalendarViewCtx } from '../../storybook-utils/ctxOptions'
import { commonTimestamps, timezone } from '../../storybook-utils/constants'
import { withCalendarEvent, withCalendarView } from '../../storybook-utils/hoc'

const meta: Meta<typeof CalendarEvent> = {
  component: CalendarEvent,
}

export default meta
type Story = StoryObj<typeof CalendarEvent>

type Props = Parameters<typeof CalendarEvent>[0]

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */

const calendarCellViewCtx = createCalendarViewCtx({
  now: commonTimestamps.now,
  rangeViewType: 'monthCellView',
  timezones: {
    ownerTimezone: timezone,
    clientTimezone: timezone,
    initialTimezoneView: {
      type: 'ownerTimezone',
    },
  },
})
const calendarLaneViewCtx = createCalendarViewCtx({
  now: commonTimestamps.now,
  rangeViewType: 'dayLaneView',
  timezones: {
    ownerTimezone: timezone,
    clientTimezone: timezone,
    initialTimezoneView: {
      type: 'ownerTimezone',
    },
  },
})

const exampleBegin = new Date(
  (function () {
    const x = new Date()
    x.setHours(12)
    x.setMinutes(45)
    x.setSeconds(0)
    x.setMilliseconds(0)
    return x
  })(),
)
const exampleEnd = new Date(
  (function () {
    const x = new Date()
    x.setHours(15)
    x.setMinutes(0)
    x.setSeconds(0)
    x.setMilliseconds(0)
    return x
  })(),
)

const eventCtxOptions: Parameters<typeof CalendarEventProvider>[0]['value'] = {
  title: 'Example Event',
  startsAt: exampleBegin,
  endsAt: exampleEnd,
  eventTag: {
    alias: 'Example',
    color: '#ffffff',
  },
  eventInfo: {
    type: 'basic',
    description: 'Example Description',
    descriptionFormat: 'Plaintext',
  },
  isConcealed: false,
  duration: 135,
}

export const CellViewPrimary: Story = {
  args: {
    isBlurred: false,
    isDampened: false,
    isEventInfoModalEnabled: true,
    eventTagOptions: {
      displayOptions: 'center',
      tooltipDirection: 'right',
    },
    trimmingOptions: {
      isTrimmedAtStart: false,
      isTrimmedAtEnd: false,
    },
    shortEventInfo: {
      type: 'titleOnly',
      smType: 'titleOnly',
      subtitle: eventFmt.formatZonedEventDuration(exampleBegin, exampleEnd),
    },
    eventTooltip: {
      isEnabled: true,
      tooltipDirection: 'right',
      content: eventFmt.formatZonedEventDuration(exampleBegin, exampleEnd),
    },
  },
  render: withCalendarView(
    calendarCellViewCtx,
    withCalendarEvent(eventCtxOptions, (props: Props) => (
      <div className="w-[200px] h-[30px]">
        <CalendarEvent {...props} />
      </div>
    )),
  ),
}

export const CellViewBlurred: Story = {
  ...CellViewPrimary,
  args: {
    ...CellViewPrimary.args,
    isBlurred: true,
    isEventInfoModalEnabled: false,
    eventTagOptions: {
      tooltipDirection: 'right',
      displayOptions: 'hide',
    },
    eventTooltip: {
      isEnabled: false,
      tooltipDirection: 'right',
      content: eventFmt.formatZonedEventDuration(exampleBegin, exampleEnd),
    },
  },
}

export const CellViewDampened: Story = {
  ...CellViewPrimary,
  args: {
    ...CellViewPrimary.args,
    isDampened: true,
  },
}

export const CellViewWithTooltipLeft: Story = {
  ...CellViewPrimary,
  args: {
    ...CellViewPrimary.args,
    eventTooltip: {
      isEnabled: true,
      tooltipDirection: 'left',
      content: eventFmt.formatZonedEventDuration(exampleBegin, exampleEnd),
    },
  },
}

export const CellViewHideEventTag: Story = {
  ...CellViewPrimary,
  args: {
    ...CellViewPrimary.args,
    eventTagOptions: {
      displayOptions: 'hide',
      tooltipDirection: 'right',
    },
  },
}

export const LaneViewPrimary: Story = {
  args: {
    isBlurred: false,
    isDampened: false,
    isEventInfoModalEnabled: true,
    eventTagOptions: {
      displayOptions: 'corner',
      tooltipDirection: 'right',
    },
    eventTooltip: {
      isEnabled: true,
      tooltipDirection: 'right',
      content: eventFmt.formatZonedEventDuration(exampleBegin, exampleEnd),
    },
    shortEventInfo: {
      type: 'all',
      smType: 'all',
      subtitle: eventFmt.formatZonedEventDuration(exampleBegin, exampleEnd),
    },
    trimmingOptions: {
      isTrimmedAtStart: false,
      isTrimmedAtEnd: false,
    },
  },
  render: withCalendarView(
    calendarLaneViewCtx,
    withCalendarEvent(eventCtxOptions, (props: Props) => (
      <div className="fixed w-full h-full flex items-center justify-center">
        <div className="flex">
          <div className="w-[100px] h-[100px] sm:w-[200px] sm:h-[200px]">
            <CalendarEvent {...props} />
          </div>
          <div className="w-[100px] h-[100px] sm:w-[200px] sm:h-[200px]">
            <CalendarEvent {...props} />
          </div>
        </div>
      </div>
    )),
  ),
}

export const LaneViewBlurred: Story = {
  ...LaneViewPrimary,
  args: {
    ...LaneViewPrimary.args,
    isBlurred: true,
    isEventInfoModalEnabled: false,
    eventTagOptions: {
      tooltipDirection: 'right',
      displayOptions: 'hide',
    },
    eventTooltip: {
      isEnabled: false,
      tooltipDirection: 'right',
      content: eventFmt.formatZonedEventDuration(exampleBegin, exampleEnd),
    },
  },
}

export const LaneViewWithTooltipLeft: Story = {
  ...LaneViewPrimary,
  args: {
    ...LaneViewPrimary.args,
    eventTagOptions: {
      tooltipDirection: 'left',
      displayOptions: 'corner',
    },
    eventTooltip: {
      isEnabled: true,
      tooltipDirection: 'left',
      content: eventFmt.formatZonedEventDuration(exampleBegin, exampleEnd),
    },
  },
}

export const LaneViewEventTrimmed: Story = {
  ...LaneViewPrimary,
  args: {
    ...LaneViewPrimary.args,
    trimmingOptions: {
      isTrimmedAtStart: true,
      isTrimmedAtEnd: true,
    },
  },
}

export const LaneViewEventTrimmedTop: Story = {
  ...LaneViewPrimary,
  args: {
    ...LaneViewPrimary.args,
    trimmingOptions: {
      isTrimmedAtStart: true,
      isTrimmedAtEnd: false,
    },
  },
}

export const LaneViewEventTrimmedBottom: Story = {
  ...LaneViewPrimary,
  args: {
    ...LaneViewPrimary.args,
    trimmingOptions: {
      isTrimmedAtStart: false,
      isTrimmedAtEnd: true,
    },
  },
}

export const LaneViewDisplayedInfoTitleOnly: Story = {
  ...LaneViewPrimary,
  args: {
    ...LaneViewPrimary.args,
    shortEventInfo: {
      type: 'titleOnly',
      smType: 'titleOnly',
      subtitle: eventFmt.formatZonedEventDuration(exampleBegin, exampleEnd),
    },
  },
}

export const LaneViewDisplayedInfoNone: Story = {
  ...LaneViewPrimary,
  args: {
    ...LaneViewPrimary.args,
    shortEventInfo: {
      type: 'nothing',
      smType: 'nothing',
      subtitle: eventFmt.formatZonedEventDuration(exampleBegin, exampleEnd),
    },
  },
}

export const LaneViewNoEventTag: Story = {
  ...LaneViewPrimary,
  args: {
    ...LaneViewPrimary.args,
    eventTagOptions: {
      tooltipDirection: 'left',
      displayOptions: 'hide',
    },
  },
}
