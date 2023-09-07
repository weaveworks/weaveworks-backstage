import { AlertApi, alertApiRef, useApi } from '@backstage/core-plugin-api';
import { KubernetesApi, kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { CustomResourceMatcher } from '@backstage/plugin-kubernetes-common';
import { useAsyncFn } from 'react-use';
import { gvkFromKind } from '../objects';
import { Deployment, Source } from '../components/helpers';

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

export function suspendRequest(
  name: string,
  namespace: string,
  clusterName: string,
  gvk: CustomResourceMatcher,
  suspend: boolean,
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
        spec: {
          suspend,
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
  suspend: boolean,
) {
  const res = await kubernetesApi.proxy(
    suspendRequest(name, namespace, clusterName, gvk, suspend),
  );
  const key = suspend ? 'Suspend' : 'Resume';
  if (!res.ok) {
    throw new Error(
      `Failed to ${key} resource: ${res.status} ${res.statusText}`,
    );
  }
}

export async function syncResource(
  resource: Source | Deployment,
  kubernetesApi: KubernetesApi,
  alertApi: AlertApi,
  suspend: boolean,
) {
  const key = suspend ? 'Suspend' : 'Resume';
  try {
    const gvk = gvkFromKind(resource.type);
    if (!gvk) {
      throw new Error(`Unknown resource type: ${resource.type}`);
    }

    if ('sourceRef' in resource && resource.sourceRef) {
      const sourceGVK = gvkFromKind(resource.sourceRef.kind);
      if (!sourceGVK) {
        throw new Error(
          `Unknown resource source type: ${resource.sourceRef.kind}`,
        );
      }
      // sync the source
      await requestSyncResource(
        kubernetesApi,
        resource.sourceRef.name!,
        resource.sourceRef.namespace || resource.namespace,
        resource.clusterName,
        sourceGVK,
        suspend,
      );
    }

    // sync the helm release
    await requestSyncResource(
      kubernetesApi,
      resource.name,
      resource.namespace,
      resource.clusterName,
      gvk,
      suspend,
    );

    alertApi.post({
      message: `${key} request successful`,
      severity: 'success',
      display: 'transient',
    });
  } catch (e: any) {
    alertApi.post({
      message: `${key} error: ${(e && e.message) || e}`,
      severity: 'error',
      display: 'transient',
    });
  }
}

/**
 *
 * @public
 */
export function useToggleSuspendResource(
  resource: Source | Deployment,
  suspend: boolean,
) {
  const kubernetesApi = useApi(kubernetesApiRef);
  const alertApi = useApi(alertApiRef);

  const [{ loading }, toggleSuspend] = useAsyncFn(
    () => syncResource(resource, kubernetesApi, alertApi, suspend),
    [resource, kubernetesApi, alert],
  );

  return { loading, toggleSuspend };
}
