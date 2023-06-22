import { FluxObject } from '@weaveworks/weave-gitops';

export function automationLastUpdated(a: FluxObject): string {
  return (
    (a.conditions.find(condition => condition.type === 'Ready') || {})
      .timestamp || ''
  );
}
