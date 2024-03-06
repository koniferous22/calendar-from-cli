import type { Meta, StoryObj } from '@storybook/react'

import { ChevronNext } from './chevronNext'

const meta: Meta<typeof ChevronNext> = {
  component: ChevronNext,
}

export default meta
type Story = StoryObj<typeof ChevronNext>

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
