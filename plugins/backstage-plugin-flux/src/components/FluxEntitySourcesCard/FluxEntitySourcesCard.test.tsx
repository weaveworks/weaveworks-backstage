import React from 'react';
import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
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
import { FluxEntitySourcesCard } from './FluxEntitySourcesCard';
import {
  makeTestGitRepository,
  makeTestHelmRepository,
  makeTestOCIRepository,
} from '../utils';
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
                makeTestGitRepository(
                  'sockshop',
                  'https://github.com/weaveworks/backstage-sockshop',
                  'main',
                ),
                makeTestGitRepository(
                  'backstage',
                  'https://github.com/weaveworks/weaveworks-backstage',
                  'main',
                ),
                makeTestOCIRepository(
                  'podinfoOCI',
                  'oci://ghcr.io/stefanprodan/manifests/podinfo',
                ),
                makeTestHelmRepository(
                  'podinfoHelm',
                  'https://stefanprodan.github.io/podinfo',
                ),
                makeTestHelmRepository(
                  'bitnami',
                  'https://repo.vmware.com/bitnami-files/index.yaml',
                ),
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

describe('<FluxEntitySourcesCard />', () => {
  let Wrapper: React.ComponentType<React.PropsWithChildren<{}>>;

  beforeEach(() => {
    Wrapper = ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    );
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('listing Sources', () => {
    it('shows the details of a Source', async () => {
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
              <FluxEntitySourcesCard />
            </EntityProvider>
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText } = result;

      const testCases = [
        {
          name: 'sockshop',
          url: 'https://github.com/weaveworks/backstage-sockshop',
          artifact: 'main',
          cluster: 'demo-cluster',
        },
        {
          name: 'backstage',
          url: 'https://github.com/weaveworks/weaveworks-backstage',
          artiface: 'main',
          cluster: 'demo-cluster',
        },
        {
          name: 'podinfoOCI',
          url: 'oci://ghcr.io/stefanprodan/manifests/podinfo',
          cluster: 'demo-cluster',
          artifact:
            'latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4',
        },
        {
          name: 'podinfoHelm',
          url: 'https://stefanprodan.github.io/podinfo',
          cluster: 'demo-cluster',
        },
        {
          name: 'bitnami',
          url: 'https://repo.vmware.com/bitnami-files/index.yaml',
          cluster: 'demo-cluster',
        },
      ];

      for (const testCase of testCases) {
        const cell = getByText(`default/${testCase.name}`);
        expect(cell).toBeInTheDocument();

        const tr = cell.closest('tr');
        expect(tr).toBeInTheDocument();
        expect(tr).toHaveTextContent(testCase.url);
        expect(tr).toHaveTextContent(testCase.cluster);
      }
    });
  });
  describe('Test listing Sources with branch', () => {
    it('shows the details of a Source', async () => {
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
              <FluxEntitySourcesCard />
            </EntityProvider>
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText } = result;

      const testCases = [
        {
          name: 'sockshop',
          url: 'https://github.com/weaveworks/backstage-sockshop',
          artifacts: 'main',
          cluster: 'demo-cluster',
        },
        {
          name: 'backstage',
          url: 'https://github.com/weaveworks/weaveworks-backstage',
          artifacts: 'main',
          cluster: 'demo-cluster',
        },
      ];

      for (const testCase of testCases) {
        const cell = getByText(`default/${testCase.name}`);
        expect(cell).toBeInTheDocument();

        const tr = cell.closest('tr');
        expect(tr).toBeInTheDocument();
        expect(tr).toHaveTextContent(testCase.url);
        expect(tr).toHaveTextContent(testCase.artifacts);
        expect(tr).toHaveTextContent(testCase.cluster);
      }
    });
  });
});
