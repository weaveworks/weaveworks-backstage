import { useApi } from '@backstage/core-plugin-api';
import { kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { useState } from 'react';
import { FluxController } from '../objects';

interface Cluster {
  name: string;
  authProvider: string;
  oidcTokenProvider?: string;
}

export const DEPLOYMENTS_PATH =
  '/apis/apps/v1/namespaces/flux-system/deployments?labelSelector=app.kubernetes.io%2Fpart-of%3Dflux&limit=500';
export function getAllDeployments(): FluxController[] {
  const kubernetesApi = useApi(kubernetesApiRef);
  const [deployments, setDeployments] = useState<any>([]);

  kubernetesApi.getClusters().then((clusters: Cluster[]) =>
    Promise.all(
      clusters.map((cluster: Cluster) =>
        kubernetesApi.proxy({
          clusterName: cluster.name,
          path: DEPLOYMENTS_PATH,
        }),
      ),
    ).then((data: any) => {
      console.log(data);
      // setDeployments(data);
    }),
  );

  // return deployments;
  return [] as FluxController[];
}
