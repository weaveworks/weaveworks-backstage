import { Entity } from '@backstage/catalog-model';
import { useCustomResources } from '@backstage/plugin-kubernetes';
import {
  ClusterAttributes,
  CustomResourceMatcher,
  KubernetesFetchError,
  ObjectsByEntityResponse,
} from '@backstage/plugin-kubernetes-common';
import { FluxObject, GitRepository, HelmRelease } from '@weaveworks/weave-gitops';
import { OciRepository } from './types';

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

type resourceCreator<T> = ({clusterName, payload}: {clusterName: string; payload: string}) => T;

function toResponse<T extends FluxObject>(create: resourceCreator<T>, kubernetesObjects?: ObjectsByEntityResponse) {
  if (!kubernetesObjects) {
    return {
      data: undefined,
      errors: undefined,
    };
  }

  const objects = kubernetesObjects.items.flatMap(
    ({ cluster, resources }) => {
      return resources?.flatMap(resourceKind => {
        return resourceKind.resources.map(resource => create({
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

  return { objects, errors: errors.length > 0 ? errors : undefined };
}

/**
 * @public
 */
export interface HelmReleasesResponse {
  data?: HelmRelease[];
  loading: boolean;
  errors?: Error[];
};

/**
 * @public
 */
export interface GitRepositoriesResponse {
  data?: GitRepository[];
  loading: boolean;
  errors?: Error[];
};

/**
 * @public
 */
export interface OciRepositoriesResponse {
  data?: OciRepository[];
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

  const { objects: data, errors: kubernetesErrors } = 
    toResponse<HelmRelease>((item) => new HelmRelease(item), kubernetesObjects);

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

  const { objects: data, errors: kubernetesErrors } = 
    toResponse<GitRepository>((item) => new GitRepository(item), kubernetesObjects);

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
};

/**
 * Query for the OciRepositories associated with this Entity.
 * @public 
 */
export function useOciRepositories(entity: Entity): OciRepositoriesResponse {
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    ociRepositoriesGVK,
  ]);

  const { objects: data, errors: kubernetesErrors } = 
    toResponse<OciRepository>((item) => new OciRepository(item), kubernetesObjects);

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
};