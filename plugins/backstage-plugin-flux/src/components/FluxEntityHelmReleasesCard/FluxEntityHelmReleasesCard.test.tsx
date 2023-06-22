import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { FluxEntityHelmReleasesCard } from './FluxEntityHelmReleasesCard';
import { configApiRef } from '@backstage/core-plugin-api';
import { ConfigReader } from '@backstage/core-app-api';
import {
  KubernetesApi,
  kubernetesApiRef,
  KubernetesAuthProvidersApi,
  kubernetesAuthProvidersApiRef,
} from '@backstage/plugin-kubernetes';
import {
  CustomObjectsByEntityRequest,
  KubernetesRequestBody,
  ObjectsByEntityResponse,
} from '@backstage/plugin-kubernetes-common';

const makeTestHelmRelease = (name: string, chart: string, version: string) => {
  return {
    apiVersion: 'helm.toolkit.fluxcd.io/v2beta1',
    kind: 'HelmRelease',
    metadata: {
      annotations: {
        'metadata.weave.works/test': 'value',
      },
      creationTimestamp: '2023-05-25T14:14:46Z',
      finalizers: ['finalizers.fluxcd.io'],
      name: name,
      namespace: 'default',
    },
    spec: {
      interval: '5m',
      chart: {
        spec: {
          chart,
          version: '45.x',
          sourceRef: {
            kind: 'HelmRepository',
            name: 'prometheus-community',
            namespace: 'default',
          },
          interval: '60m',
        },
      },
    },
    status: {
      lastAppliedRevision: version,
      conditions: [
        {
          lastTransitionTime: '2023-05-25T15:03:33Z',
          message: 'pulled "test" chart with version "1.0.0"',
          reason: 'ChartPullSucceeded',
          status: 'True',
          type: 'Ready',
        },
      ],
    },
  };
};

class StubKubernetesClient implements KubernetesApi {
  getObjectsByEntity = jest.fn();

  async getClusters(): Promise<{ name: string; authProvider: string }[]> {
    return [{ name: 'mock-cluster', authProvider: 'serviceAccount' }];
  }

  getWorkloadsByEntity = jest.fn();

  getCustomObjectsByEntity(
    _: CustomObjectsByEntityRequest,
  ): Promise<ObjectsByEntityResponse> {
    return Promise.resolve({
      items: [
        {
          cluster: {
            name: 'demo-cluster',
          },
          podMetrics: [],
          errors: [],
          resources: [
            {
              type: 'customresources',
              resources: [
                makeTestHelmRelease('redis', 'redis', '1.2.3'),
                makeTestHelmRelease('normal', 'kube-prometheus-stack', '6.3.5'),
              ],
            },
          ],
        },
      ],
    });
  }

  proxy = jest.fn();
}

class StubKubernetesAuthProvidersApi implements KubernetesAuthProvidersApi {
  decorateRequestBodyForAuth(
    _: string,
    requestBody: KubernetesRequestBody,
  ): Promise<KubernetesRequestBody> {
    return Promise.resolve(requestBody);
  }
  getCredentials(_: string): Promise<{
    token?: string;
  }> {
    return Promise.resolve({ token: 'mock-token' });
  }
}

const entity: Entity = {
  apiVersion: 'v1',
  kind: 'Component',
  metadata: {
    name: 'my-name',
    annotations: {
      'backstage.io/kubernetes-id': 'testing-service',
    },
  },
};

describe('<FluxEntityHelmReleasesCard />', () => {
  let Wrapper: React.ComponentType<React.PropsWithChildren<{}>>;

  beforeEach(() => {
    Wrapper = ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    );
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when the config contains a link to Weave GitOps', () => {
    it('shows the state of a HelmRelease', async () => {
      const result = await renderInTestApp(
        <Wrapper>
          <TestApiProvider
            apis={[
              [
                configApiRef,
                new ConfigReader({
                  gitops: { baseUrl: 'https://example.com/wego' },
                }),
              ],
              [kubernetesApiRef, new StubKubernetesClient()],
              [
                kubernetesAuthProvidersApiRef,
                new StubKubernetesAuthProvidersApi(),
              ],
            ]}
          >
            <EntityProvider entity={entity}>
              <FluxEntityHelmReleasesCard />
            </EntityProvider>
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText } = result;

      const testCases = [
        {
          name: 'default/normal',
          version: 'kube-prometheus-stack/6.3.5',
          cluster: 'demo-cluster',
        },
        {
          name: 'default/redis',
          version: 'redis/1.2.3',
          cluster: 'demo-cluster',
        },
      ];

      for (const testCase of testCases) {
        const cell = getByText(testCase.name);
        expect(cell).toBeInTheDocument();

        const td = cell.closest('td');
        expect(td).toBeInTheDocument();
        expect(td!.querySelector('a')).toBeInTheDocument();

        const tr = cell.closest('tr');
        expect(tr).toBeInTheDocument();
        expect(tr).toHaveTextContent(testCase.version);
        expect(tr).toHaveTextContent(testCase.cluster);
      }
    });
  });

  describe('when the config is not configured with a link to Weave GitOps', () => {
    it('does not include a link to Weave GitOps', async () => {
      const rendered = await renderInTestApp(
        <Wrapper>
          <TestApiProvider
            apis={[
              [configApiRef, new ConfigReader({})],
              [kubernetesApiRef, new StubKubernetesClient()],
              [
                kubernetesAuthProvidersApiRef,
                new StubKubernetesAuthProvidersApi(),
              ],
            ]}
          >
            <EntityProvider entity={entity}>
              <FluxEntityHelmReleasesCard />
            </EntityProvider>
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText } = rendered;

      const cell = getByText('default/normal');
      expect(cell).toBeInTheDocument();
      const td = cell.closest('td');
      expect(td).toBeInTheDocument();
      expect(td!.querySelector('a')).toBeNull();
    });
  });
});
