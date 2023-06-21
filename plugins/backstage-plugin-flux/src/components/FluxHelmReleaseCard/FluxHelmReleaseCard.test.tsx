import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { FluxHelmReleaseCard } from './FluxHelmReleaseCard';
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

const testHelmRelease = (
  name: string,
  chart: string,
  lastAppliedRevision: string,
) => ({
  apiVersion: 'helm.toolkit.fluxcd.io/v2beta1',
  kind: 'HelmRelease',
  metadata: {
    annotations: {
      'metadata.weave.works/test': 'value',
    },
    creationTimestamp: '2023-05-25T14:14:46Z',
    finalizers: ['finalizers.fluxcd.io'],
    name,
    namespace: 'default',
  },
  spec: {
    interval: '5m',
    chart: {
      spec: {
        chart, // : 'kube-prometheus-stack',
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
    lastAppliedRevision, // : '6.3.5',
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
});

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
                testHelmRelease('normal1', 'kube-prometheus-stack', '0.10.1'),
                testHelmRelease('normal2', 'podinfo', '6.3.5'),
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

describe('<FluxHelmReleaseCard />', () => {
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
              <FluxHelmReleaseCard />
            </EntityProvider>
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText } = result;

      expect(getByText(/kube-prometheus-stack\/0.10.1/i)).toBeInTheDocument();
      expect(getByText(/default\/normal1/i)).toBeInTheDocument();
      expect(getByText(/podinfo\/6.3.5/i)).toBeInTheDocument();
      expect(getByText(/default\/normal2/i)).toBeInTheDocument();
      // expect(getByText(/Go to Weave GitOps/i)).toBeInTheDocument();
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
              <FluxHelmReleaseCard />
            </EntityProvider>
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText, queryByText } = rendered;

      expect(getByText(/kube-prometheus-stack\/0.10.1/i)).toBeInTheDocument();
      expect(getByText(/default\/normal1/i)).toBeInTheDocument();
      expect(getByText(/podinfo\/6.3.5/i)).toBeInTheDocument();
      expect(getByText(/default\/normal2/i)).toBeInTheDocument();
      // expect(queryByText(/Go to Weave GitOps/i)).not.toBeInTheDocument();
    });
  });
});
