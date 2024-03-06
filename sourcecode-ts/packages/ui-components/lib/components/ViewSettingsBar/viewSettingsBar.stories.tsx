import type { Meta, StoryObj } from '@storybook/react'
import { useArgs } from '@storybook/preview-api'

import { ViewSettingsBar } from './viewSettingsBar'
import { createCalendarViewCtx } from '../../storybook-utils/ctxOptions'
import { commonTimestamps, timezone } from '../../storybook-utils/constants'
import { CalendarViewProvider } from '../../main'

const meta: Meta<typeof ViewSettingsBar> = {
  component: ViewSettingsBar,
}

export default meta

type Story = StoryObj<typeof ViewSettingsBar>

type Props = Parameters<typeof ViewSettingsBar>[0]
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */

const calendarCtxOptions = createCalendarViewCtx({
  now: commonTimestamps.now,
  rangeViewType: 'dayLaneView',
  timezones: {
    ownerTimezone: timezone,
    clientTimezone: 'Europe/Belfast',
    initialTimezoneView: {
      type: 'ownerTimezone',
    },
  },
})

const renderWithCalendarViewCtx =
  (ctxOptions: ReturnType<typeof createCalendarViewCtx>) =>
  ({ isPermissionViewSwitchAllowed, timezoneViewSwitchLabels }: Props) => {
    const [{ isOpen }, updateArgs] = useArgs<Props>()
    const handleClose = () => {
      updateArgs({
        isOpen: false,
      })
    }
    return (
      <CalendarViewProvider options={ctxOptions}>
        <ViewSettingsBar
          isOpen={isOpen}
          onSettingsBarClose={handleClose}
          isPermissionViewSwitchAllowed={isPermissionViewSwitchAllowed}
          timezoneViewSwitchLabels={timezoneViewSwitchLabels}
        />
      </CalendarViewProvider>
    )
  }

export const PrimarySettingsBar: Story = {
  args: {
    isOpen: true,
    isPermissionViewSwitchAllowed: true,
    timezoneViewSwitchLabels: {
      sameTimezoneText: 'You are in the same timezone as calendar owner',
    },
  },
  render: renderWithCalendarViewCtx(calendarCtxOptions),
}

export const PermissionsViewDisallowed: Story = {
  ...PrimarySettingsBar,
  args: {
    ...PrimarySettingsBar.args,
    isPermissionViewSwitchAllowed: false,
  },
}

export const CustomOwnerTimezoneLabel: Story = {
  ...PrimarySettingsBar,
  args: {
    ...PrimarySettingsBar.args,
    timezoneViewSwitchLabels: {
      sameTimezoneText: 'You are in the same timezone as calendar owner',
      customOwnerTimezoneLabel: 'Custom Label',
    },
  },
}

export const SameOwnerAndClientTimezone: Story = {
  ...PrimarySettingsBar,
  render: renderWithCalendarViewCtx(
    createCalendarViewCtx({
      now: commonTimestamps.now,
      rangeViewType: 'dayLaneView',
      timezones: {
        ownerTimezone: timezone,
        clientTimezone: timezone,
        initialTimezoneView: {
          type: 'ownerTimezone',
        },
      },
    }),
  ),
}

export const TimezoneOverride: Story = {
  ...PrimarySettingsBar,
  render: renderWithCalendarViewCtx(
    createCalendarViewCtx({
      now: commonTimestamps.now,
      rangeViewType: 'dayLaneView',
      timezones: {
        ownerTimezone: timezone,
        clientTimezone: timezone,
        initialTimezoneView: {
          type: 'custom',
          timezone: 'America/New_York',
        },
      },
    }),
  ),
}
