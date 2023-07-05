import { Config } from '@backstage/config';

export const DEFAULT_CLUSTER_ID = 'Default';

export type WeaveGitopsClusterConfig = {
  name: string;
  baseUrl: string;
};

function readClusterConfig(
  name: string,
  config: Config,
): WeaveGitopsClusterConfig {
  const baseUrl = config.getString('baseUrl');

  return {
    name,
    baseUrl
  };
}

export function readGitOpsClusterConfigs(
  config: Config,
): WeaveGitopsClusterConfig[] {
  const gitopsConfig = config.getOptionalConfig('gitops');
  if (!gitopsConfig) {
    return [];
  }

  if (gitopsConfig.has('baseUrl')) {
    return [readClusterConfig(DEFAULT_CLUSTER_ID, gitopsConfig)];
  }

  return gitopsConfig.keys().map(name => {
    const clusterConfig = gitopsConfig.getConfig(name);

    return readClusterConfig(name, clusterConfig);
  });
};