import { FluxObject } from '@weaveworks/weave-gitops';

/**
 * Represents a Flux artifact referenced by a Source object e.g. GitRepository or OCIRepository.
 * @public
 */
type Artifact = {
    digest: string;
    lastUpdateTime:string;
    metadata: Map<string,string>;
    path: string;
    revision: string;
    size: number;
    url: string;
};

/**
 * Represents a Flux OCIRepository;
 * @public
 */
export class OciRepository extends FluxObject {
  get url(): string {
    return this.obj.spec?.url || "";
  }

  get verification(): string | undefined {
    return this.obj.spec.verify.provider;
  }

  get artifact(): Artifact | undefined {
    return this.obj.status.artifact;
  }
};