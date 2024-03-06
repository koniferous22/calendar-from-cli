import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './button'

const meta: Meta<typeof Button> = {
  component: Button,
}

export default meta
type Story = StoryObj<typeof Button>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Basic: Story = {
  args: {
    label: 'Button',
  },
}

export const Inactive: Story = {
  args: {
    label: 'Button',
    isInactive: true,
  },
}

export const WithSpinner: Story = {
  args: {
    label: 'Button',
    isInactive: true,
    isLoading: true,
  },
}
