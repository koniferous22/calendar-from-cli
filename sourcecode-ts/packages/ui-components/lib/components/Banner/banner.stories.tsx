import type { Meta, StoryObj } from '@storybook/react'

import { Banner } from './banner'

const meta: Meta<typeof Banner> = {
  component: Banner,
}

export default meta
type Story = StoryObj<typeof Banner>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const ExampleError: Story = {
  args: {
    message: 'Example error from server',
    variant: 'error',
  },
}

export const ExampleMultipleErrors: Story = {
  args: {
    message: ['Example error from server 1', 'Example error from server 2', 'Example error from server 3'],
    variant: 'error',
  },
}

export const ExampleWarning: Story = {
  args: {
    message: 'Example warning',
    variant: 'warning',
  },
}

export const ExampleMultipleWarnings: Story = {
  args: {
    message: ['Example warning 1', 'Example warning 2', 'Example warning 3'],
    variant: 'warning',
  },
}
