import type { Meta, StoryObj } from '@storybook/react'

import { PasswordInput } from './passwordInput'

const meta: Meta<typeof PasswordInput> = {
  component: PasswordInput,
}

export default meta
type Story = StoryObj<typeof PasswordInput>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Basic: Story = {
  args: {},
}
