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

/**
 * Card used to show the state of Flux GitRepositories for an Entity.
 * @public
 */
export const FluxEntityGitRepositoriesCard = weaveworksFluxPlugin.provide(
  createRoutableExtension({
    name: 'FluxEntityGitRepositoriesCard',
    component: () =>
      import('./components/FluxEntityGitRepositoriesCard').then(
        m => m.FluxEntityGitRepositoriesCard,
      ),
    mountPoint: rootRouteRef,
  }),
);

/**
 * Card used to show the state of Flux OCIRepositories for an Entity.
 * @public
 */
export const FluxEntityOCIRepositoriesCard = weaveworksFluxPlugin.provide(
  createRoutableExtension({
    name: 'FluxEntityOCIRepositoriesCard',
    component: () =>
      import('./components/FluxEntityOCIRepositoriesCard').then(
        m => m.FluxEntityOCIRepositoriesCard,
      ),
    mountPoint: rootRouteRef,
  }),
);
