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
export const EntityFluxHelmReleasesCard = weaveworksFluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxHelmReleasesCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxHelmReleasesCard').then(
          m => m.EntityFluxHelmReleasesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux GitRepositories for an Entity.
 * @public
 */
export const EntityFluxGitRepositoriesCard = weaveworksFluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxGitRepositoriesCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxGitRepositoriesCard').then(
          m => m.EntityFluxGitRepositoriesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux OCIRepositories for an Entity.
 * @public
 */
export const EntityFluxOCIRepositoriesCard = weaveworksFluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxOCIRepositoriesCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxOCIRepositoriesCard').then(
          m => m.EntityFluxOCIRepositoriesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux HelmRepositories for an Entity.
 * @public
 */
export const EntityFluxHelmRepositoriesCard = weaveworksFluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxHelmRepositoriesCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxHelmRepositoriesCard').then(
          m => m.EntityFluxHelmRepositoriesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux Kustomizations for an Entity.
 * @public
 */
export const EntityFluxKustomizationsCard = weaveworksFluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxHelmRepositoriesCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxKustomizationsCard').then(
          m => m.EntityFluxKustomizationsCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux Kustomizations for an Entity.
 * @public
 */
export const EntityFluxDeploymentsCard = weaveworksFluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxDeploymentsCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxDeploymentsCard').then(
          m => m.EntityFluxDeploymentsCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux Sources for an Entity.
 * @public
 */
export const EntityFluxSourcesCard = weaveworksFluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxSourcesCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxSourcesCard').then(
          m => m.EntityFluxSourcesCard,
        ),
    },
  }),
);
