import type { Meta, StoryObj } from '@storybook/react'

import { TimesIcon } from './times'

const meta: Meta<typeof TimesIcon> = {
  component: TimesIcon,
}

export default meta
type Story = StoryObj<typeof TimesIcon>

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

export const ErrorVariant: Story = {
  args: {
    variant: 'error',
  },
}

export const WarningVariant: Story = {
  args: {
    variant: 'warning',
  },
}

export const DisabledVariant: Story = {
  args: {
    variant: 'disabled',
  },
}
