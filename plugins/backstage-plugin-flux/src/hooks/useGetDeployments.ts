import { useApi } from '@backstage/core-plugin-api';
import { KubernetesApi, kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { FluxController } from '../objects';
import { useQuery } from 'react-query';
import _ from 'lodash';

export const NAMESPACES_PATH = `/api/v1/namespaces?labelSelector=app.kubernetes.io%2Fpart-of%3Dflux&limit=500`;
export const DEPLOYMENTS_PATH = (ns: string) =>
  `/apis/apps/v1/namespaces/${ns}/deployments?labelSelector=app.kubernetes.io%2Fpart-of%3Dflux&limit=500`;

export async function getDeploymentsList(kubernetesApi: KubernetesApi) {
  const clusters = await kubernetesApi?.getClusters();

  const namespacesListsProxyData = await Promise.all(
    clusters?.map(async cluster => {
      return {
        clusterName: cluster.name,
        proxy: await kubernetesApi.proxy({
          clusterName: cluster.name,
          path: NAMESPACES_PATH,
        }),
      };
    }),
  );

  const namespacesLists = async () => {
    let namespacesLists: any[] = [];
    for (const namespacesList of namespacesListsProxyData) {
      const clusterName = namespacesList.clusterName;
      const namespaces = await namespacesList.proxy.json();
      namespacesLists = [
        ...namespacesLists,
        { clusterName, namespaces: namespaces.items },
      ];
    }
    return _.uniqWith(namespacesLists, _.isEqual);
  };

  const namespacesList = await namespacesLists();

  const deploymentsListsProxyData = await Promise.all(
    namespacesList?.flatMap(nsList =>
      nsList.namespaces.map((ns: any) =>
        kubernetesApi.proxy({
          clusterName: ns.clusterName,
          path: DEPLOYMENTS_PATH(ns.name),
        }),
      ),
    ),
  );

  const deploymentsLists = async () => {
    let items: FluxController[] = [];
    for (const item of deploymentsListsProxyData) {
      const i = await item.json();
      items = [...items, ...i.items];
    }
    return _.uniqWith(items, _.isEqual);
  };

  return await deploymentsLists();
}

/**
 *
 * @public
 */
export function useGetDeployments() {
  const kubernetesApi = useApi(kubernetesApiRef);

  const { isLoading, data, error } = useQuery<FluxController[], Error>(
    'deployments',
    () => getDeploymentsList(kubernetesApi),
  );

  return { isLoading, data, error };
}
