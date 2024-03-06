import type { Meta, StoryObj } from '@storybook/react'

import { Dropdown } from './dropdown'

const meta: Meta<typeof Dropdown> = {
  component: Dropdown,
}

export default meta
type Story = StoryObj<typeof Dropdown>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const ExampleDropdown: Story = {
  args: {
    toggleLabel: 'Options',
    options: [
      {
        label: 'Option 1',
        onSelect: () => {},
      },
      {
        label: 'Option 2',
        onSelect: () => {},
      },
    ],
  },
}
