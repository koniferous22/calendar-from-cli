import type { Meta, StoryObj } from '@storybook/react'

import { ChevronPrev } from './chevronPrev'

const meta: Meta<typeof ChevronPrev> = {
  component: ChevronPrev,
}

export default meta
type Story = StoryObj<typeof ChevronPrev>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Active: Story = {
  args: {
    isDisabled: false,
  },
}

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
}
