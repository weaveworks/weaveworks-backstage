import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { FluxObject, HelmRelease } from '@weaveworks/weave-gitops';
import { OCIRepository, GitRepository } from './types';

const typedUrl = (baseUrl: string, a: FluxObject, type: string): string => {
  const queryStringData = {
    clusterName: a.clusterName,
    name: a.name,
    namespace: a.namespace,
  };
  const queryString = Object.entries(queryStringData)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return `${baseUrl}/${type}/details?${queryString}`;
}

export const useWeaveFluxDeepLink = (resource: HelmRelease | GitRepository | OCIRepository): string | undefined => {
  const config = useApi(configApiRef);
  const baseUrl = config.getOptionalString('gitops.baseUrl');

  if (!baseUrl) {
    return undefined;
  }

  switch (resource.type) {
    case "HelmRelease":
      return typedUrl(baseUrl, resource as HelmRelease, 'helm_release');
    case "GitRepository":
      return typedUrl(baseUrl, resource as GitRepository, 'git_repo');
    case "OCIRepository":
      return typedUrl(baseUrl, resource as OCIRepository, 'oci');
    default:
      return undefined;
  }
};
