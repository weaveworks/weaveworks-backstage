import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { CustomResourceMatcher } from '@backstage/plugin-kubernetes-common';
import { HelmRelease } from '@weaveworks/weave-gitops';
import { useQuery } from 'react-query';

const HelmReleaseGVK: CustomResourceMatcher = {
  apiVersion: 'v2beta1',
  group: 'helm.toolkit.fluxcd.io',
  plural: 'helmreleases',
};

// Does not work without setting up some id provider
// https://github.com/backstage/backstage/issues/12394
//
// const res = useCustomResources(entity, [
//   {
//     apiVersion: 'v2beta1',
//     group: 'helm.toolkit.fluxcd.io',
//     plural: 'helmreleases',
//   },
// ]);
// console.log('res', res);
//
// So we re-implement the hook here:

export function useQueryHelmRelease(entity: Entity, clusterName: string) {
  const customerResourceMatcher = HelmReleaseGVK;

  const entityName =
    entity.metadata?.annotations?.['backstage.io/kubernetes-id'] ||
    entity.metadata?.name;

  const labelSelector: string =
    entity.metadata?.annotations?.['backstage.io/kubernetes-label-selector'] ||
    `backstage.io/kubernetes-id=${entityName}`;

  const namespace =
    entity.metadata?.annotations?.['backstage.io/kubernetes-namespace'];

  const basePath = [
    '/apis',
    customerResourceMatcher.group,
    customerResourceMatcher.apiVersion,
    ...(namespace ? [`namespaces/${namespace}`] : []),
    customerResourceMatcher.plural,
  ].join('/');
  const path = `${basePath}?labelSelector=${encodeURIComponent(labelSelector)}`;

  const kubernetesApi = useApi(kubernetesApiRef);

  return useQuery<HelmRelease, Error>(
    ['helmrelease', entityName, clusterName],
    async () => {
      const res = await kubernetesApi.proxy({ clusterName, path });
      if (!res.ok) {
        throw new Error(
          `Failed to fetch HelmRelease ${entityName}: ${res.statusText}`,
        );
      }
      const helmReleaseList = await res.json();
      if (!helmReleaseList.items.length) {
        throw new Error(`No HelmRelease found with name ${entityName}`);
      }
      const payload = JSON.stringify(helmReleaseList.items[0]);
      return new HelmRelease({ payload });
    },
    { retry: false, refetchInterval: 5000 },
  );
}
