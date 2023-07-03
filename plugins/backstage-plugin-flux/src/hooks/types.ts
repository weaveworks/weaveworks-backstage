import {
  OCIRepository as WeaveOCIRepository,
  GitRepository as WeaveGitRepository,
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
  isVerifiable(): boolean {
    return Boolean(this.obj.spec.verify?.provider !== undefined);
  }

  get verification(): string | undefined {
    return this.obj.spec.verify?.secretRef.name ?? '';
  }

  get artifact(): Artifact | undefined {
    return this.obj.status.artifact;
  }
}
