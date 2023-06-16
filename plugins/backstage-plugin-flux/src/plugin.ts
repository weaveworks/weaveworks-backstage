import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

/**
 * The Flux plugin.
 * @public
 */
export const weaveworksFluxPlugin = createPlugin({
  id: 'weaveworks-flux',
  routes: {
    root: rootRouteRef,
  },
});

/**
 * Card used to show the state of a Flux HelmRelease.
 * @public
 */
export const FluxHelmReleaseCard = weaveworksFluxPlugin.provide(
  createRoutableExtension({
    name: 'FluxHelmReleaseCard',
    component: () =>
      import('./components/FluxHelmReleaseCard').then(
        m => m.FluxHelmReleaseCard,
      ),
    mountPoint: rootRouteRef,
  }),
);
