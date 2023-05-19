import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const weaveFluxPlugin = createPlugin({
  id: 'weave-flux',
  routes: {
    root: rootRouteRef,
  },
});

export const WeaveFluxPage = weaveFluxPlugin.provide(
  createRoutableExtension({
    name: 'WeaveFluxPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
