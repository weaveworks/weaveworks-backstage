import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { kubernetesApiRef, KubernetesApi } from '@backstage/plugin-kubernetes';

import { rootRouteRef } from './routes';
import { fluxApiRef, FluxClient } from './api';

/**
 * The Flux plugin.
 * @public
 */
export const weaveworksFluxPlugin = createPlugin({
  id: 'weaveworks-flux',
  apis: [
    createApiFactory({
      api: fluxApiRef,
      deps: { kubernetesApi: kubernetesApiRef },
      factory: ({ kubernetesApi }: {kubernetesApi: KubernetesApi}) =>
        new FluxClient({kubernetesApi}),
    }),
  ],
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
