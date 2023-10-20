import { useApi } from '@backstage/core-plugin-api';
import { KubernetesApi, kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { FluxController } from '../objects';
import { useQuery } from 'react-query';

interface Cluster {
  name: string;
  authProvider: string;
  oidcTokenProvider?: string;
}

export const DEPLOYMENTS_PATH =
  '/apis/apps/v1/namespaces/flux-system/deployments?labelSelector=app.kubernetes.io%2Fpart-of%3Dflux&limit=500';

export async function getDeploymentsList(kubernetesApi: KubernetesApi) {
  const clusters = await kubernetesApi?.getClusters();

  const deploymentsListsProxyData = await Promise.all(
    clusters?.map((cluster: Cluster) =>
      kubernetesApi.proxy({
        clusterName: cluster.name,
        path: DEPLOYMENTS_PATH,
      }),
    ),
  );

  const deploymentsLists = async () => {
    let items: FluxController[] = [];
    for (const item of deploymentsListsProxyData) {
      const i = await item.json();
      items = [...items, ...i.items];
    }
    return items;
  };

  return await deploymentsLists();
}

/**
 *
 * @public
 */
export function getAllDeployments() {
  const kubernetesApi = useApi(kubernetesApiRef);

  const { isLoading, data, error } = useQuery<FluxController[], Error>(
    'deployments',
    () => getDeploymentsList(kubernetesApi),
  );

  return { isLoading, data, error };
}
