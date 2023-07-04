import {
  createComponentExtension,
  createPlugin,
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
  createComponentExtension({
    name: 'FluxEntityHelmReleasesCard',
    component: {
      lazy: () =>
        import('./components/FluxEntityHelmReleasesCard').then(
          m => m.FluxEntityHelmReleasesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux GitRepositories for an Entity.
 * @public
 */
export const FluxEntityGitRepositoriesCard = weaveworksFluxPlugin.provide(
  createComponentExtension({
    name: 'FluxEntityGitRepositoriesCard',
    component: {
      lazy: () =>
        import('./components/FluxEntityGitRepositoriesCard').then(
          m => m.FluxEntityGitRepositoriesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux OCIRepositories for an Entity.
 * @public
 */
export const FluxEntityOCIRepositoriesCard = weaveworksFluxPlugin.provide(
  createComponentExtension({
    name: 'FluxEntityOCIRepositoriesCard',
    component: {
      lazy: () =>
        import('./components/FluxEntityOCIRepositoriesCard').then(
          m => m.FluxEntityOCIRepositoriesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux HelmRepositories for an Entity.
 * @public
 */
export const FluxEntityHelmRepositoriesCard = weaveworksFluxPlugin.provide(
  createComponentExtension({
    name: 'FluxEntityHelmRepositoriesCard',
    component: {
      lazy: () =>
        import('./components/FluxEntityHelmRepositoriesCard').then(
          m => m.FluxEntityHelmRepositoriesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux Kustomizations for an Entity.
 * @public
 */
export const FluxEntityKustomizationsCard = weaveworksFluxPlugin.provide(
  createComponentExtension({
    name: 'FluxEntityHelmRepositoriesCard',
    component: {
      lazy: () =>
        import('./components/FluxEntityKustomizationsCard').then(
          m => m.FluxEntityKustomizationsCard,
        ),
    },
  }),
);
