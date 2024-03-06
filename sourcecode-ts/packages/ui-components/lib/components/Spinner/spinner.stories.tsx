import type { Meta, StoryObj } from '@storybook/react'

import { Spinner } from './spinner'

const meta: Meta<typeof Spinner> = {
  component: Spinner,
}

export default meta
type Story = StoryObj<typeof Spinner>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const SpeedFast: Story = {
  args: {
    speed: 'fast',
    size: 'medium',
  },
}

export const SpeedStandard: Story = {
  args: {
    speed: 'standard',
    size: 'medium',
  },
}

export const SpeedSlow: Story = {
  args: {
    speed: 'slow',
    size: 'medium',
  },
}

export const SizeSmall: Story = {
  args: {
    speed: 'standard',
    size: 'small',
  },
}

export const SizeMedium: Story = {
  args: {
    speed: 'standard',
    size: 'medium',
  },
}

export const SizeLarge: Story = {
  args: {
    speed: 'standard',
    size: 'large',
  },
}
