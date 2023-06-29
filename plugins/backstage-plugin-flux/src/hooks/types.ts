import { CustomResourceMatcher } from '@backstage/plugin-kubernetes-common';
import {
  OCIRepository as WeaveOCIRepository,
  GitRepository as WeaveGitRepository,
  FluxObject,
} from '@weaveworks/weave-gitops';

/**
 * Represents a Flux artifact referenced by a Source object e.g. GitRepository or OCIRepository.
 * @public
 */
type Artifact = {
  digest: string;
  lastUpdateTime: string;
  metadata: Map<string, string>;
  path: string;
  revision: string;
  size: number;
  url: string;
};

/**
 * Represents a Flux OCIRepository;
 * @public
 */
export class OCIRepository extends WeaveOCIRepository {
  isVerifiable(): boolean {
    return Boolean(this.obj.spec.verify?.provider !== undefined);
  }

  get verification(): string | undefined {
    return this.obj.spec.verify?.provider;
  }

  get artifact(): Artifact | undefined {
    return this.obj.status.artifact;
  }
}

/**
 * Represents a Flux GitRepository;
 * @public
 */
export class GitRepository extends WeaveGitRepository {
  get verification(): string | undefined {
    return this.obj.spec.verify?.secretRef.name ?? '';
  }

  get artifact(): Artifact | undefined {
    return this.obj.status.artifact;
  }
}

export const helmReleaseGVK: CustomResourceMatcher = {
  apiVersion: 'v2beta1',
  group: 'helm.toolkit.fluxcd.io',
  plural: 'helmreleases',
};

export const gitRepositoriesGVK: CustomResourceMatcher = {
  apiVersion: 'v1beta2',
  group: 'source.toolkit.fluxcd.io',
  plural: 'gitrepositories',
};

export const ociRepositoriesGVK: CustomResourceMatcher = {
  apiVersion: 'v1beta2',
  group: 'source.toolkit.fluxcd.io',
  plural: 'ocirepositories',
};

export const helmRepositoryGVK: CustomResourceMatcher = {
  apiVersion: 'v1beta2',
  group: 'source.toolkit.fluxcd.io',
  plural: 'helmrepositories',
};

export function gvkFromResource(
  resource: FluxObject,
): CustomResourceMatcher | undefined {
  if (resource.type === 'HelmRelease') {
    return helmReleaseGVK;
  } else if (resource.type === 'GitRepository') {
    return gitRepositoriesGVK;
  } else if (resource.type === 'OCIRepository') {
    return ociRepositoriesGVK;
  }
  return undefined;
}
