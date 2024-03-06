import type { Meta, StoryObj } from '@storybook/react'

import { CalendarLaneViewCurrentTimeMarker } from './calendarLaneViewCurrentTimeMarker'

const meta: Meta<typeof CalendarLaneViewCurrentTimeMarker> = {
  component: CalendarLaneViewCurrentTimeMarker,
}

export default meta
type Story = StoryObj<typeof CalendarLaneViewCurrentTimeMarker>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Basic: Story = {
  args: {},
  render: () => (
    <div className="fixed w-full h-full flex items-center justify-center">
      <div className="flex w-[200px]">
        <CalendarLaneViewCurrentTimeMarker />
      </div>
    </div>
  ),
}
