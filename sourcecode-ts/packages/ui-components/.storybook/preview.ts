import '../lib/index.css'
import type { Preview } from '@storybook/react'

// Edit storybook theme here
const storybookTheme = 'kenji'
document.getElementsByTagName('html')[0].setAttribute('data-theme', storybookTheme)

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
