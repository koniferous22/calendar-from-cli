import type { Meta, StoryObj } from '@storybook/react'

import { ProgressBar } from './progressBar'

const meta: Meta<typeof ProgressBar> = {
  component: ProgressBar,
}

export default meta
type Story = StoryObj<typeof ProgressBar>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Empty: Story = {
  args: {
    completed: 0,
    capacity: 11,
  },
}

export const PartiallyDone: Story = {
  args: {
    completed: 7,
    capacity: 11,
  },
}

export const Done: Story = {
  args: {
    completed: 13,
    capacity: 11,
  },
}
