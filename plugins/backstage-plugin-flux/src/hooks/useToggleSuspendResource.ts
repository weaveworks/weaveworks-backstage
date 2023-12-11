import { AlertApi, alertApiRef, useApi } from '@backstage/core-plugin-api';
import { KubernetesApi, kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { CustomResourceMatcher } from '@backstage/plugin-kubernetes-common';
import { useAsyncFn } from 'react-use';
import { gvkFromKind } from '../objects';
import { Deployment, Source } from '../components/helpers';
import { useGetUserInfo } from './useGetUser';

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

export function toggleSuspendRequest(
  name: string,
  namespace: string,
  clusterName: string,
  gvk: CustomResourceMatcher,
  suspend: boolean,
  user: string,
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
            'weave.works/suspended-by': user,
          },
        },
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

export async function requestToggleSuspendResource(
  kubernetesApi: KubernetesApi,
  name: string,
  namespace: string,
  clusterName: string,
  gvk: CustomResourceMatcher,
  suspend: boolean,
  user: string,
) {
  const res = await kubernetesApi.proxy(
    toggleSuspendRequest(name, namespace, clusterName, gvk, suspend, user),
  );
  const key = suspend ? 'Suspend' : 'Resume';
  if (!res.ok) {
    throw new Error(
      `Failed to ${key} resource: ${res.status} ${res.statusText}`,
    );
  }
}

export async function toggleSuspendResource(
  resource: Source | Deployment,
  kubernetesApi: KubernetesApi,
  alertApi: AlertApi,
  suspend: boolean,
  user: string,
) {
  const key = suspend ? 'Suspend' : 'Resume';

  try {
    const gvk = gvkFromKind(resource.type);
    if (!gvk) {
      throw new Error(`Unknown resource type: ${resource.type}`);
    }

    await requestToggleSuspendResource(
      kubernetesApi,
      resource.name,
      resource.namespace,
      resource.clusterName,
      gvk,
      suspend,
      user,
    );

    alertApi.post({
      message: `${key} request made by ${user} was successful`,
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
  const { data } = useGetUserInfo();
  const user = data?.result?.profile.email || data?.result?.userId;

  const [{ loading }, toggleSuspend] = useAsyncFn(
    () =>
      toggleSuspendResource(resource, kubernetesApi, alertApi, suspend, user),
    [resource, kubernetesApi, alert],
  );

  return { loading, toggleSuspend };
}
