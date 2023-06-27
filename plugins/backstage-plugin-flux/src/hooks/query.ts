import React from 'react';
import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { useAsyncFn } from 'react-use';
import {
  KubernetesApi,
  kubernetesApiRef,
  useCustomResources,
} from '@backstage/plugin-kubernetes';
import {
  ClusterAttributes,
  CustomResourceMatcher,
  KubernetesFetchError,
  ObjectsByEntityResponse,
} from '@backstage/plugin-kubernetes-common';

import { FluxObject, HelmRelease } from '@weaveworks/weave-gitops';
import { OCIRepository, GitRepository } from './types';

// A context to hold the useCustomResource interval so that it can be increased or decreased
// when the user changes the refresh interval.
export const FluxHelmReleasesTableContext = React.createContext<{
  refreshInterval: number;
  setRefreshInterval: (refreshInterval: number) => void;
}>({
  refreshInterval: 10000,
  setRefreshInterval: () => {},
});

const helmReleaseGVK: CustomResourceMatcher = {
  apiVersion: 'v2beta1',
  group: 'helm.toolkit.fluxcd.io',
  plural: 'helmreleases',
};

const gitRepositoriesGVK: CustomResourceMatcher = {
  apiVersion: 'v1beta2',
  group: 'source.toolkit.fluxcd.io',
  plural: 'gitrepositories',
};

const ociRepositoriesGVK: CustomResourceMatcher = {
  apiVersion: 'v1beta2',
  group: 'source.toolkit.fluxcd.io',
  plural: 'ocirepositories',
};

const helmRepositoryGVK: CustomResourceMatcher = {
  apiVersion: 'v1beta2',
  group: 'source.toolkit.fluxcd.io',
  plural: 'helmrepositories',
};

function toErrors(
  cluster: ClusterAttributes,
  errors: KubernetesFetchError[],
): Error[] {
  return errors.map(error => {
    if (error.errorType === 'FETCH_ERROR') {
      return new Error(`FETCH_ERROR (cluster=${cluster}): ${error.message}`);
    }
    return new Error(
      `${error.errorType} (cluster=${cluster}, statusCode=${error.statusCode}): ${error.resourcePath}`,
    );
  });
}

type resourceCreator<T> = ({
  clusterName,
  payload,
}: {
  clusterName: string;
  payload: string;
}) => T;

function toResponse<T extends FluxObject>(
  create: resourceCreator<T>,
  kubernetesObjects?: ObjectsByEntityResponse,
) {
  if (!kubernetesObjects) {
    return {
      data: undefined,
      kubernetesErrors: undefined,
    };
  }

  const data = kubernetesObjects.items.flatMap(({ cluster, resources }) => {
    return resources?.flatMap(resourceKind => {
      return resourceKind.resources.map(resource =>
        create({
          clusterName: cluster.name,
          payload: JSON.stringify(resource),
        }),
      );
    });
  });

  const kubernetesErrors = kubernetesObjects.items.flatMap(item =>
    toErrors(item.cluster, item.errors),
  );

  return {
    data,
    errors: kubernetesErrors.length > 0 ? kubernetesErrors : undefined,
  };
}

/**
 * @public
 */
export interface HelmReleasesResponse {
  data?: HelmRelease[];
  loading: boolean;
  errors?: Error[];
}

/**
 * @public
 */
export interface GitRepositoriesResponse {
  data?: GitRepository[];
  loading: boolean;
  errors?: Error[];
}

/**
 * @public
 */
export interface OCIRepositoriesResponse {
  data?: OCIRepository[];
  loading: boolean;
  errors?: Error[];
}

/**
 * Query for the HelmReleases associated with this Entity.
 * @public
 */
export function useHelmReleases(
  entity: Entity,
  interval?: number,
): HelmReleasesResponse {
  const { kubernetesObjects, loading, error } = useCustomResources(
    entity,
    [helmReleaseGVK],
    interval,
  );

  const { data, kubernetesErrors } = toResponse<HelmRelease>(
    item => new HelmRelease(item),
    kubernetesObjects,
  );

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
}

/**
 * Query for the GitRepositories associated with this Entity.
 * @public
 */
export function useGitRepositories(entity: Entity): GitRepositoriesResponse {
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    gitRepositoriesGVK,
  ]);

  const { data, kubernetesErrors } = toResponse<GitRepository>(
    item => new GitRepository(item),
    kubernetesObjects,
  );

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
}

/**
 * Query for the OCIRepositories associated with this Entity.
 * @public
 */
export function useOCIRepositories(entity: Entity): OCIRepositoriesResponse {
  const { kubernetesObjects, loading, error } = useCustomResources(
    entity,
    [ociRepositoriesGVK],
    60000000,
  );

  const { data, kubernetesErrors } = toResponse<OCIRepository>(
    item => new OCIRepository(item),
    kubernetesObjects,
  );

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
}

const pathForResource = (
  name: string,
  namespace: string,
  gvk: CustomResourceMatcher,
): string => {
  const basePath = [
    '/apis',
    gvk.group,
    gvk.apiVersion,
    ...(namespace ? [`namespaces/${namespace}`] : []),
    gvk.plural,
    name,
  ].join('/');

  return basePath;
};

const ReconcileRequestAnnotation = 'reconcile.fluxcd.io/requestedAt';

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

export async function syncResource(
  kubernetesApi: KubernetesApi,
  name: string,
  namespace: string,
  clusterName: string,
  gvk: CustomResourceMatcher,
) {
  const now = new Date().toISOString();
  const res = await kubernetesApi.proxy(
    syncRequest(name, namespace, clusterName, gvk, now),
  );
  if (!res.ok) {
    throw new Error(`Failed to sync resource: ${res.statusText}`);
  }

  for (let i = 0; i < 10; i++) {
    const pollResponse = await kubernetesApi.proxy(
      getRequest(name, namespace, clusterName, gvk),
    );
    const helmReleaseResponse = await pollResponse.json();
    const lastHandledReconcileAt =
      helmReleaseResponse.status.lastHandledReconcileAt;
    if (lastHandledReconcileAt === now) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Timed out waiting for status to update');
}

export function useSyncResource(hr: HelmRelease) {
  const kubernetesApi = useApi(kubernetesApiRef);
  const { setRefreshInterval } = React.useContext(FluxHelmReleasesTableContext);

  const [{ value, loading, error }, sync] = useAsyncFn(async () => {
    try {
      // setRefreshInterval(1000);

      // sync the source
      await syncResource(
        kubernetesApi,
        hr.sourceRef!.name!,
        hr.sourceRef!.namespace!,
        hr.clusterName,
        helmRepositoryGVK,
      );

      // sync the helm release
      await syncResource(
        kubernetesApi,
        hr.name,
        hr.namespace,
        hr.clusterName,
        helmReleaseGVK,
      );
    } finally {
      // setRefreshInterval(10000);
    }
  }, [hr, setRefreshInterval, kubernetesApi]);

  return { sync, isSyncing: loading, error, value };
}
