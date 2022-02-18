import '@digirati/canvas-panel-web-components';
import { addParameters } from '@storybook/client-api';

addParameters({
  viewMode: 'docs',
});

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
