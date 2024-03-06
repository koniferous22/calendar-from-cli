import type { Meta, StoryObj } from '@storybook/react'

import { CalendarHeader } from './calendarHeader'
import { addYears } from 'date-fns'
import { createCalendarViewCtx } from '../../../storybook-utils/ctxOptions'
import { commonTimestamps, timezone } from '../../../storybook-utils/constants'
import { withCalendarView, withLoader } from '../../../storybook-utils/hoc'

const meta: Meta<typeof CalendarHeader> = {
  component: CalendarHeader,
}

export default meta
type Story = StoryObj<typeof CalendarHeader>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */

export const Primary: Story = {
  args: {
    title: 'Calendar Title',
    settingsBar: {
      isPermissionViewSwitchAllowed: true,
      timezoneViewSwitchLabels: {
        sameTimezoneText: 'You are in the same timezone as calendar owner',
      },
    },
    calendarListingLimits: {
      pastBrowsing: {
        enabled: true,
        lowerLimit: new Date(0),
      },
      futureBrowsingUpperLimit: addYears(commonTimestamps.now, 50),
    },
    arrowKeyboardEventDebounce: 500,
  },
  render: (props: Parameters<typeof CalendarHeader>[0]) =>
    withLoader(
      {
        isLoading: false,
        shouldDisplayLoaderOverlay: false,
      },
      withCalendarView(
        createCalendarViewCtx({
          now: commonTimestamps.now,
          rangeViewType: 'dayLaneView',
          timezones: {
            ownerTimezone: timezone,
            clientTimezone: 'Europe/Belfast',
            initialTimezoneView: {
              type: 'ownerTimezone',
            },
          },
        }),
        CalendarHeader,
      ),
    )(props),
}

export const PrevViewDisallowed: Story = {
  ...Primary,
  args: {
    ...Primary.args,
    calendarListingLimits: {
      futureBrowsingUpperLimit: Primary.args?.calendarListingLimits?.futureBrowsingUpperLimit!,
      pastBrowsing: {
        enabled: false,
      },
    },
  },
}

export const LoadingWithHeaderSpinner: Story = {
  ...Primary,
  args: {
    ...Primary.args,
    shouldDisplayLoaderAsHeaderIcon: true,
  },
  render: (props: Parameters<typeof CalendarHeader>[0]) =>
    withLoader(
      {
        isLoading: true,
        shouldDisplayLoaderOverlay: false,
      },
      withCalendarView(
        createCalendarViewCtx({
          now: commonTimestamps.now,
          rangeViewType: 'dayLaneView',
          timezones: {
            ownerTimezone: timezone,
            clientTimezone: 'Europe/Belfast',
            initialTimezoneView: {
              type: 'ownerTimezone',
            },
          },
        }),
        CalendarHeader,
      ),
    )(props),
}
