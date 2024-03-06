import type { Meta, StoryObj } from '@storybook/react'

import { MonthCellViewHeader } from './calendarMonthCellViewHeader'

const meta: Meta<typeof MonthCellViewHeader> = {
  component: MonthCellViewHeader,
}

export default meta
type Story = StoryObj<typeof MonthCellViewHeader>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const ExampleConflictArea: Story = {}
