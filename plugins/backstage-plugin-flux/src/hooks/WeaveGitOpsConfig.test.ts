import { ConfigReader } from '@backstage/config';

import { DEFAULT_CLUSTER_ID, readGitOpsClusterConfigs } from './WeaveGitOpsConfig';

describe('readGitOpsClusterConfigs', () => {
  describe('when there is no configuration provided', () => {
    it('reads no configuration', () => {
      const config = new ConfigReader({});
      const clusterConfigs = readGitOpsClusterConfigs(config);

      expect(clusterConfigs).toHaveLength(0);
    });
  });

  describe('when a single configuration is provided', () => {
    it('reads a single cluster configuration', () => {
      const config = new ConfigReader({
        gitops: { baseUrl: 'https://wego.example.com' },
      });

      const clusterConfigs = readGitOpsClusterConfigs(config);

      expect(clusterConfigs).toEqual([
        {
          baseUrl: 'https://wego.example.com',
          name: DEFAULT_CLUSTER_ID,
        }
      ]);
    });
  });

  describe('when multiple configurations are provided', () => {
    it('reads multiple cluster configurations', () => {
      const config = new ConfigReader({
        gitops: {
          'prod-cluster': {
            baseUrl: 'https://wego1.example.com',
          },
          'dev-cluster': {
            baseUrl: 'https://wego2.example.com',
          }
        },
      });

      const clusterConfigs = readGitOpsClusterConfigs(config);

      expect(clusterConfigs).toEqual([
        {
          baseUrl: 'https://wego1.example.com',
          name: 'prod-cluster',
        },
        {
          baseUrl: 'https://wego2.example.com',
          name: 'dev-cluster',
        },
      ]);
    });
  });
});