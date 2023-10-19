import { useApi } from '@backstage/core-plugin-api';
import { kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { FluxController } from '../objects';

interface Cluster {
  name: string;
  authProvider: string;
  oidcTokenProvider?: string;
}

export const DEPLOYMENTS_PATH =
  '/apis/apps/v1/namespaces/flux-system/deployments?labelSelector=app.kubernetes.io%2Fpart-of%3Dflux&limit=500';

export async function getAllDeployments() {
  const kubernetesApi = useApi(kubernetesApiRef);

  const clusters = await kubernetesApi.getClusters();

  const deploymentsListsProxyData = await Promise.all(
    clusters.map((cluster: Cluster) =>
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

  return deploymentsLists;
}
