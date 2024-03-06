import type { Meta, StoryObj } from '@storybook/react'

import { CalendarLaneViewDayLabel } from './calendarLaneViewDayLabel'

const meta: Meta<typeof CalendarLaneViewDayLabel> = {
  component: CalendarLaneViewDayLabel,
}

export default meta
type Story = StoryObj<typeof CalendarLaneViewDayLabel>

const today = new Date()
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Today: Story = {
  args: {
    dayOfWeek: today.getDay(),
    shouldHighlightNumber: true,
    dayOfMonth: today.getDate(),
    navigation: {
      type: 'button',
      onClick: () => {},
    },
  },
}

export const Tomorrow: Story = {
  args: {
    ...Today.args,
    dayOfWeek: tomorrow.getDay(),
    shouldHighlightNumber: false,
    dayOfMonth: tomorrow.getDate(),
  },
}
