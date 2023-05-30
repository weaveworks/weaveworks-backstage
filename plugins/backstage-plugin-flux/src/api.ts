import {
  createApiRef,
} from '@backstage/core-plugin-api';
import { KubernetesApi } from '@backstage/plugin-kubernetes';
import { HelmRelease } from '@weaveworks/weave-gitops';
import { CustomResourceMatcher } from '@backstage/plugin-kubernetes-common';
import { Entity } from '@backstage/catalog-model';

const helmReleaseGVK: CustomResourceMatcher = {
  apiVersion: 'v2beta1',
  group: 'helm.toolkit.fluxcd.io',
  plural: 'helmreleases',
};


/**
 * Get the kubernetes-id Backstage annotation, or if it doesn't exist, the
 * Entity name.
 */
export const kubernetesIdOrNameFromEntity = (entity: Entity): string => {
    return entity.metadata?.annotations?.['backstage.io/kubernetes-id'] || entity.metadata?.name;
};

/**
 * @public
 */
export const fluxApiRef = createApiRef<FluxApi>({
  id: 'plugin.flux.service',
});

/**
 * Interface for the FluxApi.
 * @public
 */
export interface FluxApi {
  /**
   * Returns a HelmRelease with the name/cluster combination.
   * @param clusterName - The name of a cluster to make the request against.
   * @param kubernetesId
   * @param namespace - The namespace of the HelmRelease to fetch.
   */
  getHelmReleaseInCluster(clusterName: string, entity: Entity): Promise<HelmRelease>;
}

/**
 * Default implementation of the FluxApi.
 * @public
 */
export class FluxClient implements FluxApi {
  private readonly kubernetesApi: KubernetesApi;

  constructor({ kubernetesApi }: { kubernetesApi: KubernetesApi; }) {
    this.kubernetesApi = kubernetesApi;
  }

  async getHelmReleaseInCluster(clusterName: string, entity: Entity): Promise<HelmRelease> {
    const res = await this.kubernetesApi.proxy({ clusterName: clusterName, path: pathForResource(entity, helmReleaseGVK) });
    if (!res.ok) {
      throw new Error(
        `Failed to fetch HelmRelease for ${entity.metadata.name}: ${res.statusText}`,
      );
    }

    const helmReleaseList = await res.json();
    if (!helmReleaseList.items.length) {
      throw new Error(`No HelmRelease found with name ${entity.metadata.name}`);
    }

    const payload = JSON.stringify(helmReleaseList.items[0]);

    return new HelmRelease({ payload });
  }
};

const pathForResource = (entity: Entity, gvk: CustomResourceMatcher): string => {
  const entityName = kubernetesIdOrNameFromEntity(entity);

  const labelSelector: string =
    entity.metadata?.annotations?.['backstage.io/kubernetes-label-selector'] ||
    `backstage.io/kubernetes-id=${entityName}`;

  const namespace =
    entity.metadata?.annotations?.['backstage.io/kubernetes-namespace'];

  const basePath = [
    '/apis',
    gvk.group,
    gvk.apiVersion,
    ...(namespace ? [`namespaces/${namespace}`] : []),
    gvk.plural,
  ].join('/');

  return `${basePath}?labelSelector=${encodeURIComponent(labelSelector)}`;
};