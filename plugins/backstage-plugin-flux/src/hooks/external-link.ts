import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { HelmRelease } from '../objects';

function weaveGitopsHelmReleaseLink(baseUrl: string, a: HelmRelease): string {
  const queryStringData = {
    clusterName: a.clusterName,
    name: a.name,
    namespace: a.namespace,
  };
  const queryString = Object.entries(queryStringData)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return `${baseUrl}/helm_release/details?${queryString}`;
}

export const useWeaveFluxDeepLink = (helmRelease: HelmRelease) => {
  const config = useApi(configApiRef);
  const baseUrl = config.getOptionalString('gitops.baseUrl');
  if (!baseUrl) {
    return undefined;
  }
  return weaveGitopsHelmReleaseLink(baseUrl, helmRelease);
};
