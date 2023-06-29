import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { KubernetesApi, kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { CustomResourceMatcher } from '@backstage/plugin-kubernetes-common';
import {
  GitRepository,
  HelmRelease,
  OCIRepository,
} from '@weaveworks/weave-gitops';
import { useAsyncFn } from 'react-use';
import { gvkFromResource, helmReleaseGVK, helmRepositoryGVK } from './types';

const ReconcileRequestAnnotation = 'reconcile.fluxcd.io/requestedAt';

export type SyncResource = HelmRelease | OCIRepository | GitRepository;

export const pathForResource = (
  name: string,
  namespace: string,
  gvk: CustomResourceMatcher,
): string => {
  const basePath = [
    '/apis',
    gvk.group,
    gvk.apiVersion,
    'namespaces',
    namespace,
    gvk.plural,
    name,
  ].join('/');

  return basePath;
};

export function syncRequest(
  name: string,
  namespace: string,
  clusterName: string,
  gvk: CustomResourceMatcher,
  now: string,
) {
  return {
    clusterName,
    path: pathForResource(name, namespace, gvk),
    init: {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify({
        metadata: {
          annotations: {
            [ReconcileRequestAnnotation]: now,
          },
        },
      }),
    },
  };
}

export function getRequest(
  name: string,
  namespace: string,
  clusterName: string,
  gvk: CustomResourceMatcher,
) {
  return {
    clusterName,
    path: pathForResource(name, namespace, gvk),
  };
}

export async function requestSyncResource(
  kubernetesApi: KubernetesApi,
  name: string,
  namespace: string,
  clusterName: string,
  gvk: CustomResourceMatcher,
  now: string,
  pollInterval: number = 2000,
) {
  const res = await kubernetesApi.proxy(
    syncRequest(name, namespace, clusterName, gvk, now),
  );
  if (!res.ok) {
    throw new Error(`Failed to sync resource: ${res.status} ${res.statusText}`);
  }

  for (let i = 0; i < 10; i++) {
    const pollResponse = await kubernetesApi.proxy(
      getRequest(name, namespace, clusterName, gvk),
    );
    if (!pollResponse.ok) {
      throw new Error('Failed to poll resource');
    }
    const helmReleaseResponse = await pollResponse.json();
    const lastHandledReconcileAt =
      helmReleaseResponse.status.lastHandledReconcileAt;
    if (lastHandledReconcileAt === now) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Timed out waiting for status to update');
}

async function syncResource(
  resource: SyncResource,
  kubernetesApi: KubernetesApi,
) {
  const gvk = gvkFromResource(resource);
  if (!gvk) {
    throw new Error(`Unknown resource type: ${resource.type}`);
  }

  if ('sourceRef' in resource && resource.sourceRef) {
    // sync the source
    await requestSyncResource(
      kubernetesApi,
      resource.sourceRef.name!,
      resource.sourceRef.namespace!,
      resource.clusterName,
      helmRepositoryGVK,
      new Date().toISOString(),
    );
  }

  // sync the helm release
  await requestSyncResource(
    kubernetesApi,
    resource.name,
    resource.namespace,
    resource.clusterName,
    helmReleaseGVK,
    new Date().toISOString(),
  );
}

export function useSyncResource(resource: SyncResource) {
  const kubernetesApi = useApi(kubernetesApiRef);
  const alertApi = useApi(alertApiRef);

  const [{ loading }, sync] = useAsyncFn(async () => {
    try {
      await syncResource(resource, kubernetesApi);

      alertApi.post({
        message: 'Sync request successful',
        severity: 'success',
        display: 'transient',
      });
    } catch (e: any) {
      alertApi.post({
        message: `Sync error: ${(e && e.message) || e}`,
        severity: 'error',
        display: 'transient',
      });
    }
  }, [resource, kubernetesApi]);

  return { sync, isSyncing: loading };
}
