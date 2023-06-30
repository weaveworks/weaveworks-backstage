import { Entity } from '@backstage/catalog-model';
import { useCustomResources } from '@backstage/plugin-kubernetes';
import {
  ClusterAttributes,
  KubernetesFetchError,
  ObjectsByEntityResponse,
} from '@backstage/plugin-kubernetes-common';
import {
  FluxObject,
  GitRepository,
  HelmRelease,
  OCIRepository,
  gitRepositoriesGVK,
  helmReleaseGVK,
  ociRepositoriesGVK,
} from '../objects';

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
export function useHelmReleases(entity: Entity): HelmReleasesResponse {
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    helmReleaseGVK,
  ]);

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
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    ociRepositoriesGVK,
  ]);

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
