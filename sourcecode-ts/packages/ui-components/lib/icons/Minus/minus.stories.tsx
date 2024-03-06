import type { Meta, StoryObj } from '@storybook/react'

import { MinusIcon } from './minus'

const meta: Meta<typeof MinusIcon> = {
  component: MinusIcon,
}

export default meta
type Story = StoryObj<typeof MinusIcon>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const StandardVariant: Story = {
  args: {
    variant: 'standard',
  },
}

export const InactiveVariant: Story = {
  args: {
    variant: 'inactive',
  },
}
