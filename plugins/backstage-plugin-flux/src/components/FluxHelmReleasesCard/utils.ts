import { HelmRelease } from '@weaveworks/weave-gitops';

export function automationLastUpdated(a: HelmRelease): string {
  return (
    (a.conditions.find(condition => condition.type === 'Ready') || {})
      .timestamp || ''
  );
}
