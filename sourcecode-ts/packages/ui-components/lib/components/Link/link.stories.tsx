import type { Meta, StoryObj } from '@storybook/react'

import { LinkComponent } from './link'

const meta: Meta<typeof LinkComponent> = {
  component: LinkComponent,
}

export default meta
type Story = StoryObj<typeof LinkComponent>

/*
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Basic: Story = {
  args: {
    linkText: 'Example link',
  },
}
