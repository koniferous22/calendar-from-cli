import type { Meta, StoryObj } from '@storybook/react'

import { Hr } from './hr'

const meta: Meta<typeof Hr> = {
  component: Hr,
}

export default meta
type Story = StoryObj<typeof Hr>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Basic: Story = {
  args: {},
}
