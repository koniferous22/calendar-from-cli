import type { Meta, StoryObj } from '@storybook/react'

import { PlusIcon } from './plus'

const meta: Meta<typeof PlusIcon> = {
  component: PlusIcon,
}

export default meta
type Story = StoryObj<typeof PlusIcon>

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
