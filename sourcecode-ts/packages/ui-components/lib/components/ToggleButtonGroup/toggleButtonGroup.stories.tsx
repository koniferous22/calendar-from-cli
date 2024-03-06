import type { Meta, StoryObj } from '@storybook/react'
import { useArgs } from '@storybook/preview-api'

import { ToggleButtonGroup } from './toggleButtonGroup'

const meta: Meta<typeof ToggleButtonGroup> = {
  component: ToggleButtonGroup,
}

export default meta

type Story = StoryObj<typeof ToggleButtonGroup>

type Props = Parameters<typeof ToggleButtonGroup>[0]

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const PrimaryToggleButtonGroup = {
  args: {
    title: 'Example Title',
    buttons: [
      { label: 'Button 1', onClick: () => {} },
      { label: 'Button 2', onClick: () => {} },
      { label: 'Button 3', onClick: () => {} },
      { label: 'Button 4', onClick: () => {} },
      { label: 'Button 5', onClick: () => {} },
      // { label: 'Button 6', onClick: () => {} },
      // { label: 'Button 7', onClick: () => {} },
      // { label: 'Button 8', onClick: () => {} },
      // { label: 'Button 9', onClick: () => {} },
      // { label: 'Button 10', onClick: () => {} },
    ],
    activeButton: null,
  },
  /**
   * 👇 To avoid linting issues, it is recommended to use a function with a capitalized name.
   * If you are not concerned with linting, you may use an arrow function.
   */
  render: (args: Props) => {
    const [{ activeButton, buttons }, updateArgs] = useArgs<Props>()
    const handleClick = (index: number, onClick: () => void) => {
      updateArgs({
        activeButton: index,
      })
      onClick()
    }
    // NOTE (as any cast) - length preserved
    const transformedButtons: Props['buttons'] = buttons.map(({ label, onClick }, index) => ({
      label,
      onClick: () => handleClick(index, onClick),
    })) as any

    return <ToggleButtonGroup title={args.title} activeButton={activeButton} buttons={transformedButtons} />
  },
}

export const ViewPickerButtonGroup: Story = {
  ...PrimaryToggleButtonGroup,
  args: {
    buttons: [
      { label: 'Day', onClick: () => {} },
      { label: 'Week', onClick: () => {} },
      { label: 'Month', onClick: () => {} },
    ],
  },
}
