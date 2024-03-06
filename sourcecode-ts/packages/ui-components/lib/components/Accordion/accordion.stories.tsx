import type { Meta, StoryObj } from '@storybook/react'

import { Accordion } from './accordion'

const meta: Meta<typeof Accordion> = {
  component: Accordion,
}

export default meta
type Story = StoryObj<typeof Accordion>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  args: {
    items: [
      {
        title: 'Item 1',
        content: <div>Hello</div>,
      },
      {
        title: 'Item 2',
        content: <div>World</div>,
      },
    ],
  },
}

export const ComponentBackground: Story = {
  args: {
    ...Primary.args,
    background: 'component',
  },
}
