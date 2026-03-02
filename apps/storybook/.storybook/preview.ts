import type { Preview } from '@storybook/react';
import { withThemeByClassName } from '@storybook/addon-themes';
import './storybook.css';

const preview: Preview = {
  decorators: [
    // @ts-expect-error -- addon-themes Renderer type diverges from ReactRenderer in SB10
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
