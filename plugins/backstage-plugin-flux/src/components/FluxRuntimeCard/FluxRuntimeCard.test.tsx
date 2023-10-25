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
  images: string[],
  clusterName: string,
  labels: { [name: string]: string },
) => {
  return {
    name,
    namespace,
    conditions: [
      {
        type: 'Available',
        status: 'True',
        reason: 'MinimumReplicasAvailable',
        message: 'Deployment has minimum availability.',
        timestamp: '',
      },
      {
        type: 'Progressing',
        status: 'True',
        reason: 'NewReplicaSetAvailable',
        message: 'ReplicaSet has successfully progressed.',
        timestamp: '',
      },
    ],
    images,
    suspended: false,
    clusterName,
    uid: '4527e05c-eed4-489d-93ae-0cd66ca3277e',
    labels,
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
            makeTestFluxController(
              'helm-controller',
              'flux-system',
              ['ghcr.io/fluxcd/helm-controller:v0.36.2'],
              'mock-cluster-1',
              {
                'app.kubernetes.io/component': 'helm-controller',
                'app.kubernetes.io/instance': 'flux-system',
                'app.kubernetes.io/part-of': 'flux',
                'app.kubernetes.io/version': 'v2.1.2',
                'control-plane': 'controller',
                'kustomize.toolkit.fluxcd.io/name': 'flux-system',
                'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
              },
            ),
            makeTestFluxController(
              'image-automation-controller',
              'flux-system',
              ['ghcr.io/fluxcd/image-automation-controller:v0.36.1'],
              'mock-cluster-1',
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
            makeTestFluxController(
              'image-automation-controller',
              'default',
              ['ghcr.io/fluxcd/image-automation-controller:v0.36.1'],
              'mock-cluster-2',
              {
                'app.kubernetes.io/component': 'image-automation-controller',
                'app.kubernetes.io/instance': 'default',
                'app.kubernetes.io/part-of': 'flux',
                'app.kubernetes.io/version': 'v2.1.2',
                'control-plane': 'controller',
                'kustomize.toolkit.fluxcd.io/name': 'default',
                'kustomize.toolkit.fluxcd.io/namespace': 'default',
              },
            ),
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
