import { FluxObject } from '@weaveworks/weave-gitops';

export class OciRepository extends FluxObject {
  get url(): string {
    return this.obj.spec?.url || "";
  }

  get verification(): string | undefined {
    return this.obj.spec.verify.provider;
  }

  get revision(): string | undefined {
    return this.obj.status.artifact?.revision;
  }
};