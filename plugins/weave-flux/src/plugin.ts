import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const weaveFluxPlugin = createPlugin({
  id: 'weave-flux',
  routes: {
    root: rootRouteRef,
  },
});

export const WeaveFluxCard = weaveFluxPlugin.provide(
  createRoutableExtension({
    name: 'WeaveFluxCard',
    component: () =>
      import('./components/WeaveFluxCard').then(m => m.WeaveFluxCard),
    mountPoint: rootRouteRef,
  }),
);
