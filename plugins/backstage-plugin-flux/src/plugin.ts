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
 * Card used to show the state of Flux HelmReleases for an Entity.
 * @public
 */
export const FluxEntityHelmReleasesCard = weaveworksFluxPlugin.provide(
  createRoutableExtension({
    name: 'FluxEntityHelmReleasesCard',
    component: () =>
      import('./components/FluxEntityHelmReleasesCard').then(
        m => m.FluxEntityHelmReleasesCard,
      ),
    mountPoint: rootRouteRef,
  }),
);
