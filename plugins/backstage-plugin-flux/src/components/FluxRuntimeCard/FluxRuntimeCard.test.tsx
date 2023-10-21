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
import { baseControllerLabels } from '../../../dev';

const makeTestFluxController = (
  name: string,
  images: string[],
  clusterName: string,
  labels: { [name: string]: string },
) => {
  return {
    name,
    namespace: 'flux-system',
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
              ['ghcr.io/fluxcd/helm-controller:v0.36.2'],
              'mock-cluster-1',
              {
                ...baseControllerLabels,
                'app.kubernetes.io/component': 'helm-controller',
              },
            ),
            makeTestFluxController(
              'image-automation-controller',
              ['ghcr.io/fluxcd/image-automation-controller:v0.36.1'],
              'mock-cluster-1',
              {
                ...baseControllerLabels,
                'app.kubernetes.io/component': 'image-automation-controller',
              },
            ),
            makeTestFluxController(
              'image-automation-controller',
              ['ghcr.io/fluxcd/image-automation-controller:v0.36.1'],
              'mock-cluster-2',
              {
                ...baseControllerLabels,
                'app.kubernetes.io/component': 'image-automation-controller',
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
          namespace: 'flux-system',
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
        expect(tr).toHaveTextContent(testCase.availableComponents[0]);
        expect(tr).toHaveTextContent(testCase.availableComponents[1]);
      }
    });
  });
});
