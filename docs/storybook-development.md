# Storybook development

## Running storybook dev server

```sh
yarn --cwd sourcecode-ts ui-components:storybook
```

## Theming in storybook

Switching themes (for now) in the storybook dev server is implemented through manually changing constant in `sourcecode-ts/packages/ui-components/.storybook/preview.ts`

## Package setup (Inspiration)

Package setup made fully through steps specified in [`dev.to` - Create a Component Library Fast🚀(using Vite's library mode)](https://dev.to/receter/how-to-create-a-react-component-library-using-vites-library-mode-4lma)
