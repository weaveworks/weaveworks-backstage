import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { FluxObject, GitRepository, HelmRelease } from '@weaveworks/weave-gitops';

function typedUrl(baseUrl: string, a: FluxObject, type: string): string {
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

function weaveGitopsHelmReleaseLink(baseUrl: string, a: HelmRelease): string {
  return typedUrl(baseUrl, a, 'helm_release');
}

function weaveGitopsGitRepositoryLink(baseUrl: string, a: GitRepository): string {
  return typedUrl(baseUrl, a, 'git_repository');
}

export const useWeaveFluxDeepLink = (resource: HelmRelease | GitRepository): string | undefined => {
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
  }

  return undefined;
};
