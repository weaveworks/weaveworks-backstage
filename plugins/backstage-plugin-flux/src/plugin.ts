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
export const FluxHelmReleasesCard = weaveworksFluxPlugin.provide(
  createRoutableExtension({
    name: 'FluxHelmReleasesCard',
    component: () =>
      import('./components/FluxHelmReleasesCard').then(
        m => m.FluxHelmReleasesCard,
      ),
    mountPoint: rootRouteRef,
  }),
);
