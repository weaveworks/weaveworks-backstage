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

export const FluxHelmReleaseCard = weaveFluxPlugin.provide(
  createRoutableExtension({
    name: 'FluxHelmReleaseCard',
    component: () =>
      import('./components/FluxHelmReleaseCard').then(
        m => m.FluxHelmReleaseCard,
      ),
    mountPoint: rootRouteRef,
  }),
);
