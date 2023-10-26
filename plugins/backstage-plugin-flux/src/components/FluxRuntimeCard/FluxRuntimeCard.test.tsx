import React from 'react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { configApiRef } from '@backstage/core-plugin-api';
import { ConfigReader } from '@backstage/core-app-api';
import {
  KubernetesApi,
  kubernetesApiRef,
  KubernetesAuthProvidersApi,
  kubernetesAuthProvidersApiRef,
} from '@backstage/plugin-kubernetes';
import { KubernetesRequestBody } from '@backstage/plugin-kubernetes-common';
import { FluxRuntimeCard } from './FluxRuntimeCard';

const makeTestFluxController = (
  name: string,
  namespace: string,
  labels: { [name: string]: string },
) => {
  return {
    apiVersion: 'meta.k8s.io/v1',
    kind: 'PartialObjectMetadata',
    metadata: {
      name,
      namespace,
      uid: 'b062d329-538d-4bb3-b4df-b2ac4b06dba8',
      resourceVersion: '1001263',
      generation: 1,
      creationTimestamp: '2023-10-19T16:34:14Z',
      labels,
      annotations: {
        'deployment.kubernetes.io/revision': '1',
      },
    },
  };
};

class StubKubernetesClient implements KubernetesApi {
  getObjectsByEntity = jest.fn();

  async getClusters(): Promise<{ name: string; authProvider: string }[]> {
    return [
      { name: 'mock-cluster-1', authProvider: 'serviceAccount1' },
      { name: 'mock-cluster-2', authProvider: 'serviceAccount2' },
    ];
  }

  getWorkloadsByEntity = jest.fn();

  getCustomObjectsByEntity = jest.fn();

  async proxy(): Promise<Response> {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          kind: 'DeploymentList',
          apiVersion: 'apps/v1',
          items: [
            makeTestFluxController('helm-controller', 'flux-system', {
              'app.kubernetes.io/component': 'helm-controller',
              'app.kubernetes.io/instance': 'flux-system',
              'app.kubernetes.io/part-of': 'flux',
              'app.kubernetes.io/version': 'v2.1.2',
              'control-plane': 'controller',
              'kustomize.toolkit.fluxcd.io/name': 'flux-system',
              'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
            }),
            makeTestFluxController(
              'image-automation-controller',
              'flux-system',
              {
                'app.kubernetes.io/component': 'image-automation-controller',
                'app.kubernetes.io/instance': 'flux-system',
                'app.kubernetes.io/part-of': 'flux',
                'app.kubernetes.io/version': 'v2.1.2',
                'control-plane': 'controller',
                'kustomize.toolkit.fluxcd.io/name': 'flux-system',
                'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
              },
            ),
            makeTestFluxController('image-automation-controller', 'default', {
              'app.kubernetes.io/component': 'image-automation-controller',
              'app.kubernetes.io/instance': 'default',
              'app.kubernetes.io/part-of': 'flux',
              'app.kubernetes.io/version': 'v2.1.2',
              'control-plane': 'controller',
              'kustomize.toolkit.fluxcd.io/name': 'default',
              'kustomize.toolkit.fluxcd.io/namespace': 'default',
            }),
          ],
        }),
    }) as Promise<Response>;
  }
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

describe('<FluxRuntimeCard />', () => {
  let Wrapper: React.ComponentType<React.PropsWithChildren<{}>>;

  beforeEach(() => {
    Wrapper = ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    );
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('listing Flux Controllers per Cluster', () => {
    it('shows for each cluster what flux controllers are running', async () => {
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
            <FluxRuntimeCard />
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText } = result;

      const testCases = [
        {
          name: 'mock-cluster-1',
          namespace: 'flux-system',
          version: 'v2.1.2',
          availableComponents: [
            'helm-controller',
            'image-automation-controller',
          ],
        },
        {
          name: 'mock-cluster-2',
          namespace: 'default',
          version: 'v2.1.2',
          availableComponents: ['image-automation-controller'],
        },
      ];

      for (const testCase of testCases) {
        const cell = getByText(testCase.name);
        expect(cell).toBeInTheDocument();

        const tr = cell.closest('tr');
        expect(tr).toBeInTheDocument();
        expect(tr).toHaveTextContent(testCase.namespace);
        expect(tr).toHaveTextContent(testCase.availableComponents.join(', '));
      }
    });
  });
});
