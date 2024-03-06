import type { Meta, StoryObj } from '@storybook/react'

import { CalendarIcon } from './calendar'

const meta: Meta<typeof CalendarIcon> = {
  component: CalendarIcon,
}

export default meta
type Story = StoryObj<typeof CalendarIcon>

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
