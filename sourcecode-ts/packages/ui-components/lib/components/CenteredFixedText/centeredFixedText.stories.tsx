import type { Meta, StoryObj } from '@storybook/react'

import { CenteredFixedText } from './centeredFixedText'

const meta: Meta<typeof CenteredFixedText> = {
  component: CenteredFixedText,
}

export default meta
type Story = StoryObj<typeof CenteredFixedText>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Basic: Story = {
  args: {
    text: 'Example text',
  },
}
