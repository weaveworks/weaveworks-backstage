import { configApiRef, useApi } from '@backstage/core-plugin-api';

import {
  FluxObject,
  GitRepository,
  HelmRelease,
  Kustomization,
  HelmRepository,
  OCIRepository,
} from '../objects';


const typedUrl = (baseUrl: string, a: FluxObject, type: string): string => {
  const queryStringData = {
    clusterName: a.clusterName,
    name: a.name,
    namespace: a.namespace,
  };

  const searchParams = new URLSearchParams(queryStringData);

  return `${baseUrl.replace(/\/$/, '')}/${type}/details?${searchParams.toString()}`;
};

export const useWeaveFluxDeepLink = (
  resource: FluxObject,
): string | undefined => {
  const config = useApi(configApiRef);
  const baseUrl = config.getOptionalString('gitops.baseUrl');

  if (!baseUrl) {
    return undefined;
  }

  switch (resource.type) {
    case 'HelmRelease':
      return typedUrl(baseUrl, resource as HelmRelease, 'helm_release');
    case 'GitRepository':
      return typedUrl(baseUrl, resource as GitRepository, 'git_repo');
    case 'OCIRepository':
      return typedUrl(baseUrl, resource as OCIRepository, 'oci');
    case 'Kustomization':
      return typedUrl(baseUrl, resource as Kustomization, 'kustomization');
    case 'HelmRepository':
      return typedUrl(baseUrl, resource as HelmRepository, 'helm_repo');
    default:
      return undefined;
  }
};
