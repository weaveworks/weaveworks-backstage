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
import * as helmRepository from '../../__fixtures__/helm_repository.json';

const makeTestGitRepository = (name: string, url: string, branch: string) => {
  return {
    apiVersion: 'source.toolkit.fluxcd.io/v1',
    kind: 'GitRepository',
    metadata: {
      creationTimestamp: '2023-06-22T17:58:23Z',
      finalizers: ['finalizers.fluxcd.io'],
      generation: 1,
      name: name,
      namespace: 'default',
      resourceVersion: '132764',
      uid: '068ec137-b2a0-4b35-90ea-4e9a8a2fe5f6',
    },
    spec: {
      interval: '1m',
      ref: {
        branch: branch,
      },
      timeout: '60s',
      url: url,
    },
    status: {
      artifact: {
        digest:
          'sha256:f1e2d4a8244772c47d5e10b38768acec57dc404d6409464c15d2eb8c84b28b51',
        lastUpdateTime: '2023-06-22T17:58:24Z',
        path: 'gitrepository/default/podinfo/e06a5517daf5ac8c5ba74a97135499e40624885a.tar.gz',
        revision: `${branch}@sha1:e06a5517daf5ac8c5ba74a97135499e40624885a`,
        size: 80053,
        url: 'http://source-controller.flux-system.svc.cluster.local./gitrepository/default/podinfo/e06a5517daf5ac8c5ba74a97135499e40624885a.tar.gz',
      },
      conditions: [
        {
          lastTransitionTime: '2023-06-22T17:58:24Z',
          message:
            "stored artifact for revision 'master@sha1:e06a5517daf5ac8c5ba74a97135499e40624885a'",
          observedGeneration: 1,
          reason: 'Succeeded',
          status: 'True',
          type: 'Ready',
        },
        {
          lastTransitionTime: '2023-06-22T17:58:24Z',
          message:
            "stored artifact for revision 'master@sha1:e06a5517daf5ac8c5ba74a97135499e40624885a'",
          observedGeneration: 1,
          reason: 'Succeeded',
          status: 'True',
          type: 'ArtifactInStorage',
        },
      ],
      observedGeneration: 1,
    },
  };
};

const makeTestHelmRepository = (name: string, url: string) => {
  const repo = JSON.parse(JSON.stringify(helmRepository));

  repo.metadata.name = name;
  repo.spec.url = url;

  return repo;
};

const makeTestOCIRepository = (name: string, url: string) => {
  return {
    apiVersion: 'source.toolkit.fluxcd.io/v1beta2',
    kind: 'OCIRepository',
    metadata: {
      creationTimestamp: '2023-06-23T07:50:47Z',
      finalizers: ['finalizers.fluxcd.io'],
      generation: 1,
      name: name,
      namespace: 'default',
      resourceVersion: '143955',
      uid: '1ec54278-ed2d-4f31-9bb0-39dc7163730e',
    },
    spec: {
      interval: '5m',
      provider: 'generic',
      timeout: '60s',
      url: url,
      verify: {
        provider: 'cosign',
      },
    },
    status: {
      artifact: {
        digest:
          'sha256:62df151eb3714d9dfa943c7d88192d72466bffa268b25595f85530b793f77524',
        lastUpdateTime: '2023-06-23T07:50:53Z',
        metadata: {
          'org.opencontainers.image.created': '2023-05-03T14:30:58Z',
          'org.opencontainers.image.revision':
            '6.3.6/073f1ec5aff930bd3411d33534e91cbe23302324',
          'org.opencontainers.image.source':
            'https://github.com/stefanprodan/podinfo',
        },
        path: 'ocirepository/default/podinfo/sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4.tar.gz',
        revision:
          'latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4',
        size: 1071,
        url: 'http://source-controller.flux-system.svc.cluster.local./ocirepository/default/podinfo/sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4.tar.gz',
      },
      conditions: [
        {
          lastTransitionTime: '2023-06-23T07:50:53Z',
          message:
            "stored artifact for digest 'latest@sha256: 2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'",
          observedGeneration: 1,
          reason: 'Succeeded',
          status: 'True',
          type: 'Ready',
        },
        {
          lastTransitionTime: '2023-06 - 23T07: 50: 53Z',
          message:
            "stored artifact for digest 'latest @sha256: 2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'",
          observedGeneration: 1,
          reason: 'Succeeded',
          status: 'True',
          type: 'ArtifactInStorage',
        },
        {
          lastTransitionTime: '2023-06-23T07:50:52Z',
          message:
            "verified signature of revision latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'",
          observedGeneration: 1,
          reason: 'Succeeded',
          status: 'True',
          type: 'SourceVerified',
        },
      ],
      observedGeneration: 1,
      url: 'http://source-controller.flux-system.svc.cluster.local./ocirepository/default/podinfo/latest.tar.gz',
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
          branch: 'main',
          cluster: 'demo-cluster',
        },
        {
          name: 'backstage',
          url: 'https://github.com/weaveworks/weaveworks-backstage',
          branch: 'main',
          cluster: 'demo-cluster',
        },
        {
          name: 'podinfoOCI',
          url: 'oci://ghcr.io/stefanprodan/manifests/podinfo',
          cluster: 'demo-cluster',
          revision:
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
        if (testCase.branch) {
          expect(tr).toHaveTextContent(testCase.branch);
        }
        expect(tr).toHaveTextContent(testCase.cluster);
      }
    });
  });
});
