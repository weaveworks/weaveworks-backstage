import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { FluxObject, GitRepository, HelmRelease } from '@weaveworks/weave-gitops';
import { OciRepository } from './types';

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

const weaveGitopsHelmReleaseLink = (baseUrl: string, a: HelmRelease): string => 
  typedUrl(baseUrl, a, 'helm_release');

const weaveGitopsGitRepositoryLink = (baseUrl: string, a: GitRepository): string => 
  typedUrl(baseUrl, a, 'git_repository');

export const useWeaveFluxDeepLink = (resource: HelmRelease | GitRepository | OciRepository): string | undefined => {
  const config = useApi(configApiRef);
  const baseUrl = config.getOptionalString('gitops.baseUrl');

  if (!baseUrl) {
    return undefined;
  }

  switch (resource.type) {
    case "HelmRelease":
      return weaveGitopsHelmReleaseLink(baseUrl, resource as HelmRelease);
    case "GitRepository":
      return weaveGitopsGitRepositoryLink(baseUrl, resource as GitRepository);

    default:
      return undefined;
  }
};
