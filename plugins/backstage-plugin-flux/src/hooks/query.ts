import { Entity } from '@backstage/catalog-model';
import { useCustomResources } from '@backstage/plugin-kubernetes';
import {
  ClusterAttributes,
  CustomResourceMatcher,
  KubernetesFetchError,
  ObjectsByEntityResponse,
} from '@backstage/plugin-kubernetes-common';
import { GitRepository, HelmRelease } from '@weaveworks/weave-gitops';

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

function toHelmReleases(kubernetesObjects?: ObjectsByEntityResponse) {
  if (!kubernetesObjects) {
    return {
      helmReleases: undefined,
      errors: undefined,
    };
  }

  const helmReleases = kubernetesObjects.items.flatMap(
    ({ cluster, resources }) => {
      return resources?.flatMap(resourceKind => {
        return resourceKind.resources.map(resource => {
          const helmRelease = new HelmRelease({
            clusterName: cluster.name,
            payload: JSON.stringify(resource),
          });
          return helmRelease;
        });
      });
    },
  );

  const errors = kubernetesObjects.items.flatMap(item =>
    toErrors(item.cluster, item.errors),
  );

  return { helmReleases, errors: errors.length > 0 ? errors : undefined };
}

function toGitRepositories(kubernetesObjects?: ObjectsByEntityResponse) {
  if (!kubernetesObjects) {
    return {
      data: undefined,
      errors: undefined,
    };
  }

  const gitRepositories = kubernetesObjects.items.flatMap(
    ({ cluster, resources }) => {
      return resources?.flatMap(resourceKind => {
        return resourceKind.resources.map(resource => new GitRepository({
            clusterName: cluster.name,
            payload: JSON.stringify(resource),
          })
        )
      });
    },
  );

  const errors = kubernetesObjects.items.flatMap(item =>
    toErrors(item.cluster, item.errors),
  );

  return { gitRepositories, errors: errors.length > 0 ? errors : undefined };
}

/**
 * @public
 */
export interface HelmReleasesResponse {
  data?: HelmRelease[];
  loading: boolean;
  errors?: Error[];
};

export interface GitRepositoriesResponse {
  data?: GitRepository[];
  loading: boolean;
  errors?: Error[];
};

/**
 * Query for the HelmReleases associated with this Entity.
 * @public 
 */
export function useHelmReleases(entity: Entity): HelmReleasesResponse {
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    helmReleaseGVK,
  ]);

  const { helmReleases: data, errors: kubernetesErrors } =
    toHelmReleases(kubernetesObjects);

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
};


/**
 * Query for the GitRepositories associated with this Entity.
 * @public 
 */
export function useGitRepositories(entity: Entity): GitRepositoriesResponse {
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    gitRepositoriesGVK,
  ]);

  const { gitRepositories: data, errors: kubernetesErrors } =
    toGitRepositories(kubernetesObjects);

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
};
