import type { Meta, StoryObj } from '@storybook/react'

import { CalendarLaneViewLegend } from './calendarLaneViewLegend'

const meta: Meta<typeof CalendarLaneViewLegend> = {
  component: CalendarLaneViewLegend,
}

export default meta
type Story = StoryObj<typeof CalendarLaneViewLegend>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Raw: Story = {
  render: () => {
    return (
      <div className="w-1/2">
        <CalendarLaneViewLegend />
      </div>
    )
  },
}
