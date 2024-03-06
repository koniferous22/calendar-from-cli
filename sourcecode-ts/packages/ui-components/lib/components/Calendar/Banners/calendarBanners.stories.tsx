import type { Meta, StoryObj } from '@storybook/react'

import { createCalendarViewCtx } from '../../../storybook-utils/ctxOptions'
import { commonTimestamps, timezone } from '../../../storybook-utils/constants'
import { CalendarBanners } from './calendarBanners'
import { withCalendarView } from '../../../storybook-utils/hoc'

const meta: Meta<typeof CalendarBanners> = {
  component: CalendarBanners,
}

export default meta
type Story = StoryObj<typeof CalendarBanners>

type Props = Parameters<typeof CalendarBanners>[0]

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */

const calendarViewCtx = createCalendarViewCtx({
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

const customTimezoneCalendarViewCtx = createCalendarViewCtx({
  now: commonTimestamps.now,
  rangeViewType: 'monthCellView',
  timezones: {
    ownerTimezone: timezone,
    clientTimezone: timezone,
    initialTimezoneView: {
      type: 'custom',
      timezone: 'Europe/Belfast',
    },
  },
})

export const BasicErrorMessages: Story = {
  args: {
    errorBannerMessages: ['Error message 1', 'Error message 2', 'Error message 3'],
  },
  render: withCalendarView(calendarViewCtx, (props: Props) => <CalendarBanners {...props} />),
}

export const ErrorsWithTimezoneWarning: Story = {
  args: {
    errorBannerMessages: ['Error message 1', 'Error message 2', 'Error message 3'],
  },
  render: withCalendarView(customTimezoneCalendarViewCtx, (props: Props) => <CalendarBanners {...props} />),
}
