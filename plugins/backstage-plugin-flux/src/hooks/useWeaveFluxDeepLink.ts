import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { Config } from '@backstage/config';
import {
  FluxObject,
  GitRepository,
  HelmRelease,
  Kustomization,
  HelmRepository,
  OCIRepository,
} from '../objects';
import { WeaveGitopsClusterConfig, readGitOpsClusterConfigs } from './WeaveGitOpsConfig';

const typedUrl = (baseUrl: string, a: FluxObject, type: string): string => {
  const queryStringData = {
    clusterName: a.clusterName,
    name: a.name,
    namespace: a.namespace,
  };

  const queryString = Object.entries(queryStringData)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return `${baseUrl.replace(/\/$/, '')}/${type}/details?${queryString}`;
};

const baseUrlForCluster = (config: Config, resource: FluxObject): string | undefined => {
  const clusterConfigs = readGitOpsClusterConfigs(config);
  if (clusterConfigs.length === 0) {
    return undefined;
  }

  if (clusterConfigs.length === 1) {
    return clusterConfigs[0].baseUrl;
  }

  return clusterConfigs.find(
    (clusterConf: WeaveGitopsClusterConfig) =>
      clusterConf.name === resource.clusterName)?.baseUrl;
}

export const useWeaveFluxDeepLink = (
  resource: FluxObject,
): string | undefined => {
  const config = useApi(configApiRef);
  const baseUrl = baseUrlForCluster(config, resource);

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
