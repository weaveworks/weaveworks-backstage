import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { HelmRelease } from '@weaveworks/weave-gitops';

function weaveGitopsHelmReleaseLink(
  baseUrl: string,
  a: HelmRelease,
  clusterName: string,
): string {
  const queryStringData = {
    clusterName,
    name: a.name,
    namespace: a.namespace,
  };
  const queryString = Object.entries(queryStringData)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return `${baseUrl}/helm_release/details?${queryString}`;
}

export const useWeaveFluxDeepLink = (
  helmRelease: HelmRelease,
  clusterName: string,
) => {
  const config = useApi(configApiRef);
  const baseUrl = config.getOptionalString('gitops.baseUrl');
  if (!baseUrl) {
    return undefined;
  }
  return {
    title: 'Go to Weave GitOps',
    link: weaveGitopsHelmReleaseLink(baseUrl, helmRelease, clusterName),
  };
};
