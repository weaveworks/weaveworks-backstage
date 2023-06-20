export function automationLastUpdated(a: HelmRelease): string {
  return (a.conditions.find(condition =>  condition.type === 'Ready') || {}).timestamp || '';
}
