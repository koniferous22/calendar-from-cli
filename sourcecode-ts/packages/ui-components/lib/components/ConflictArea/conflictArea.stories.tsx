import type { Meta, StoryObj } from '@storybook/react'

import { ConflictArea } from './conflictArea'
import { withCalendarView, withConflictArea } from '../../storybook-utils/hoc'
import { createCalendarViewCtx } from '../../storybook-utils/ctxOptions'
import { commonTimestamps, timezone } from '../../storybook-utils/constants'

const meta: Meta<typeof ConflictArea> = {
  component: ConflictArea,
}

export default meta
type Story = StoryObj<typeof ConflictArea>

type Props = Parameters<typeof ConflictArea>[0]

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */

const calendarViewCtx = createCalendarViewCtx({
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

const events = [
  {
    title: 'Example Event 1',
    eventInfo: {
      type: 'basic',
      description: 'Example Description',
      descriptionFormat: 'Plaintext',
    },
    startsAt: exampleBegin,
    endsAt: exampleEnd,
    now: commonTimestamps.now,
  },
  {
    title: 'Example Event 2',
    eventInfo: {
      type: 'basic',
      description: 'Example Description',
      descriptionFormat: 'Plaintext',
    },
    startsAt: exampleBegin,
    endsAt: exampleEnd,
    now: commonTimestamps.now,
  },
]

export const Primary: Story = {
  args: {
    isDampened: false,
    isBlurred: false,
    isConflictAreaModalEnabled: true,
    tooltipDirection: 'below',
    trimmingOptions: {
      isTrimmedAtStart: false,
      isTrimmedAtEnd: false,
    },
  },
  render: withCalendarView(
    calendarViewCtx,
    withConflictArea(
      {
        conflictAreaStartsAt: exampleBegin,
        conflictAreaEndsAt: exampleEnd,
        events: events as any,
      },
      (props: Props) => (
        <div className="fixed w-full h-full flex items-center justify-center">
          <div className="w-[200px] h-[200px]">
            <ConflictArea {...props} />
          </div>
        </div>
      ),
    ),
  ),
}

export const Blurred: Story = {
  ...Primary,
  args: {
    ...Primary.args,
    isDampened: true,
    isBlurred: true,
    isConflictAreaModalEnabled: false,
  },
}

export const TrimmedStart: Story = {
  ...Primary,
  args: {
    ...Primary.args,
    trimmingOptions: {
      isTrimmedAtStart: true,
      isTrimmedAtEnd: false,
    },
  },
}

export const TrimmedEnd: Story = {
  ...Primary,
  args: {
    ...Primary.args,
    trimmingOptions: {
      isTrimmedAtStart: false,
      isTrimmedAtEnd: true,
    },
  },
}

export const TrimmedBoth: Story = {
  ...Primary,
  args: {
    ...Primary.args,
    trimmingOptions: {
      isTrimmedAtStart: true,
      isTrimmedAtEnd: true,
    },
  },
}

export const TooltipLeft: Story = {
  ...Primary,
  args: {
    ...Primary.args,
    tooltipDirection: 'left',
  },
}
