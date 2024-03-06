import type { Meta, StoryObj } from '@storybook/react'

import { Title } from './title'

const meta: Meta<typeof Title> = {
  component: Title,
}

export default meta
type Story = StoryObj<typeof Title>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  args: {
    text: 'Example Title',
  },
}
