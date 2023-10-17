import { useApi } from '@backstage/core-plugin-api';
import { KubernetesApi, kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { useAsyncFn } from 'react-use';

export const DEPLOYMENTS_PATH =
  '/apis/apps/v1/namespaces/flux-system/deployments?labelSelector=app.kubernetes.io%2Fpart-of%3Dflux&limit=500';

export async function getAllDeployments(kubernetesApi: KubernetesApi) {
  const res = await kubernetesApi.getClusters();

  let allDeployments: any = [];

  res.map(async cluster => {
    const deployments = await kubernetesApi.proxy({
      clusterName: cluster.name,
      path: DEPLOYMENTS_PATH,
    });

    allDeployments.push(deployments);
  });

  return allDeployments;
}

/**
 *
 * @public
 */
export function useGetDeployments() {
  const kubernetesApi = useApi(kubernetesApiRef);

  const [{ loading, error }, getDeployments] = useAsyncFn(
    () => getAllDeployments(kubernetesApi),
    [kubernetesApi, alert],
  );

  return { loading, error, getDeployments };
}
