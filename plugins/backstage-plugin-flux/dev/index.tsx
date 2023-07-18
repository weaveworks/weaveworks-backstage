import React from 'react';
import { Content } from '@backstage/core-components';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { configApiRef } from '@backstage/core-plugin-api';
import { ConfigReader } from '@backstage/core-app-api';
import {
  KubernetesApi,
  KubernetesAuthProvidersApi,
  kubernetesApiRef,
  kubernetesAuthProvidersApiRef,
} from '@backstage/plugin-kubernetes';
import {
  KubernetesRequestBody,
  ObjectsByEntityResponse,
  WorkloadsByEntityRequest,
  CustomObjectsByEntityRequest,
} from '@backstage/plugin-kubernetes-common';
import { TestApiProvider } from '@backstage/test-utils';
import {
  weaveworksFluxPlugin,
  FluxEntityHelmReleasesCard,
  FluxEntityGitRepositoriesCard,
  FluxEntityOCIRepositoriesCard,
  FluxEntityHelmRepositoriesCard,
  FluxEntityKustomizationsCard,
  FluxEntityDeploymentsCard,
} from '../src/plugin';
import {
  newTestHelmRelease,
  newTestOCIRepository,
  newTestGitRepository,
  newTestKustomization,
  newTestHelmRepository,
} from './helpers';
import { ReconcileRequestAnnotation } from '../src/hooks';
import { FluxEntitySourcesCard } from '../src/components/FluxEntitySourcesCard';

const fakeEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'backstage.io/kubernetes-id': 'fake-service',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

class StubKubernetesClient implements KubernetesApi {
  private resources: any[];
  private mockResponses: Record<string, Response[]> = {};

  constructor(resources: any[]) {
    this.resources = resources;
  }

  getObjectsByEntity(
    _: KubernetesRequestBody,
  ): Promise<ObjectsByEntityResponse> {
    throw new Error('getObjectsByEntityMethod not implemented.');
  }

  async getClusters(): Promise<{ name: string; authProvider: string }[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [{ name: 'mock-cluster', authProvider: 'serviceAccount' }];
  }

  getWorkloadsByEntity(
    _: WorkloadsByEntityRequest,
  ): Promise<ObjectsByEntityResponse> {
    throw new Error('getWorkloadsByEntityMethod not implemented.');
  }
  async getCustomObjectsByEntity(
    _: CustomObjectsByEntityRequest,
  ): Promise<ObjectsByEntityResponse> {
    // wait 100ms
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
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
              resources: this.resources,
            },
          ],
        },
      ],
    };
  }

  // this is only used by sync right now, so it looks a little bit funny
  async proxy({
    init,
    path,
  }: {
    clusterName: string;
    path: string;
    init?: RequestInit | undefined;
  }): Promise<any> {
    // wait 100ms
    await new Promise(resolve => setTimeout(resolve, 100));

    // Assumption: The initial request!
    // Generates 2 more subsequent requests that can be retrieved in order via GET'ing
    //
    if (init?.method === 'PATCH') {
      const data = JSON.parse(init.body as string);
      const reconiliationRequestedAt =
        data.metadata.annotations[ReconcileRequestAnnotation];
      this.mockResponses[path] = [
        // request 1, not ready yet, so you can see the progress bar
        {
          ok: true,
          json: () =>
            Promise.resolve({
              status: {
                lastHandledReconcileAt: 'not quite',
              },
            }),
        } as Response,
        // request 2, ready! sync'd properly.
        {
          ok: true,
          json: () =>
            Promise.resolve({
              status: {
                lastHandledReconcileAt: reconiliationRequestedAt,
              },
            }),
        } as Response,
      ];

      return {
        ok: true,
      } as Response;
    }

    // very simple right now
    if (this.mockResponses[path]?.length) {
      // shift pops the [0]th element off the array
      return this.mockResponses[path].shift();
    }

    throw new Error(
      "The mock responses didn't seem to line up with the UI behaviour. Sorry about that",
    );
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

createDevApp()
  .addPage({
    title: 'Helm Releases',
    path: '/helm-releases',
    element: (
      <TestApiProvider
        apis={[
          [
            configApiRef,
            new ConfigReader({
              gitops: { baseUrl: 'https://example.com/wego' },
            }),
          ],
          [
            kubernetesApiRef,
            new StubKubernetesClient([
              newTestHelmRelease(
                'prometheus1',
                'kube-prometheus-stack',
                '6.3.5',
              ),
              newTestHelmRelease(
                'prometheus2',
                'kube-prometheus-stack',
                '6.3.5',
              ),
              newTestHelmRelease(
                'prometheus3',
                'kube-prometheus-stack',
                '6.3.5',
              ),
              newTestHelmRelease('redis1', 'redis', '7.0.1', 'False'),
              newTestHelmRelease('redis2', 'redis', '7.0.1'),
              newTestHelmRelease('http-api', 'redis', '1.2.5', 'False'),
              newTestHelmRelease('queue-runner', 'redis', '1.0.1'),
            ]),
          ],
          [kubernetesAuthProvidersApiRef, new StubKubernetesAuthProvidersApi()],
        ]}
      >
        <EntityProvider entity={fakeEntity}>
          <Content>
            <FluxEntityHelmReleasesCard />
          </Content>
        </EntityProvider>
      </TestApiProvider>
    ),
  })
  .addPage({
    title: 'Git Repositories',
    path: '/git-repositories',
    element: (
      <TestApiProvider
        apis={[
          [
            configApiRef,
            new ConfigReader({
              gitops: { baseUrl: 'https://example.com/wego' },
            }),
          ],
          [
            kubernetesApiRef,
            new StubKubernetesClient([
              newTestGitRepository(
                'podinfo',
                'https://github.com/stefanprodan/podinfo',
                { verify: true, verified: true },
              ),
              newTestGitRepository(
                'weave-gitops',
                'https://github.com/weaveworks/weave-gitops',
              ),
              newTestGitRepository(
                'weaveworks-backstage',
                'https://github.com/weaveworks/weaveworks-backstage',
                { verify: true, verified: false },
              ),
              newTestGitRepository(
                'weave-gitops-enterprise',
                'https://github.com/weaveworks/weave-gitops-enterprise',
              ),
            ]),
          ],
          [kubernetesAuthProvidersApiRef, new StubKubernetesAuthProvidersApi()],
        ]}
      >
        <EntityProvider entity={fakeEntity}>
          <Content>
            <FluxEntityGitRepositoriesCard />
          </Content>
        </EntityProvider>
      </TestApiProvider>
    ),
  })
  .addPage({
    title: 'OCI Repositories',
    path: '/oci-repositories',
    element: (
      <TestApiProvider
        apis={[
          [
            configApiRef,
            new ConfigReader({
              gitops: { baseUrl: 'https://example.com/wego' },
            }),
          ],
          [
            kubernetesApiRef,
            new StubKubernetesClient([
              newTestOCIRepository(
                'podinfo',
                'oci://ghcr.io/stefanprodan/manifests/podinfo',
                { verify: true, verified: true },
              ),
              newTestOCIRepository(
                'redis',
                'oci://registry-1.docker.io/bitnamicharts/redis',
              ),
              newTestOCIRepository(
                'postgresql',
                'oci://registry-1.docker.io/bitnamicharts/postgresql',
                { verify: true, verified: false },
              ),
              newTestOCIRepository(
                'apache',
                'oci://registry-1.docker.io/bitnamicharts/apache',
                { ready: false },
              ),
              newTestOCIRepository(
                'supabase',
                'oci://registry-1.docker.io/bitnamicharts/supabase',
                { verify: true, pending: true },
              ),
              newTestOCIRepository(
                'mariadb',
                'oci://registry-1.docker.io/bitnamicharts/mariadb',
                { verify: true, verified: false },
              ),
            ]),
          ],

          [kubernetesAuthProvidersApiRef, new StubKubernetesAuthProvidersApi()],
        ]}
      >
        <EntityProvider entity={fakeEntity}>
          <Content>
            <FluxEntityOCIRepositoriesCard />
          </Content>
        </EntityProvider>
      </TestApiProvider>
    ),
  })
  .addPage({
    title: 'Kustomizations',
    path: '/kustomizations',
    element: (
      <TestApiProvider
        apis={[
          [
            configApiRef,
            new ConfigReader({
              gitops: { baseUrl: 'https://example.com/wego' },
            }),
          ],
          [
            kubernetesApiRef,
            new StubKubernetesClient([
              newTestKustomization(
                'flux-system',
                './clusters/my-cluster',
                true,
              ),
              newTestKustomization(
                'test-kustomization',
                './clusters/my-cluster',
                true,
              ),
            ]),
          ],

          [kubernetesAuthProvidersApiRef, new StubKubernetesAuthProvidersApi()],
        ]}
      >
        <EntityProvider entity={fakeEntity}>
          <Content>
            <FluxEntityKustomizationsCard />
          </Content>
        </EntityProvider>
      </TestApiProvider>
    ),
  })
  .addPage({
    title: 'Helm Repositories',
    path: '/helm-repositories',
    element: (
      <TestApiProvider
        apis={[
          [
            configApiRef,
            new ConfigReader({
              gitops: { baseUrl: 'https://example.com/wego' },
            }),
          ],
          [
            kubernetesApiRef,
            new StubKubernetesClient([
              newTestHelmRepository(
                'podinfo',
                'https://stefanprodan.github.io/podinfo',
              ),
            ]),
          ],

          [kubernetesAuthProvidersApiRef, new StubKubernetesAuthProvidersApi()],
        ]}
      >
        <EntityProvider entity={fakeEntity}>
          <Content>
            <FluxEntityHelmRepositoriesCard />
          </Content>
        </EntityProvider>
      </TestApiProvider>
    ),
  })
  .addPage({
    title: 'Deployments',
    path: '/deployments',
    element: (
      <TestApiProvider
        apis={[
          [
            configApiRef,
            new ConfigReader({
              gitops: { baseUrl: 'https://example.com/wego' },
            }),
          ],
          [
            kubernetesApiRef,
            new StubKubernetesClient([
              newTestKustomization(
                'flux-system',
                './clusters/my-cluster',
                true,
              ),
              newTestHelmRelease(
                'prometheus1',
                'kube-prometheus-stack',
                '6.3.5',
              ),
            ]),
          ],

          [kubernetesAuthProvidersApiRef, new StubKubernetesAuthProvidersApi()],
        ]}
      >
        <EntityProvider entity={fakeEntity}>
          <Content>
            <FluxEntityDeploymentsCard />
          </Content>
        </EntityProvider>
      </TestApiProvider>
    ),
  })
  .addPage({
    title: 'Sources',
    path: '/sources',
    element: (
      <TestApiProvider
        apis={[
          [
            configApiRef,
            new ConfigReader({
              gitops: { baseUrl: 'https://example.com/wego' },
            }),
          ],
          [
            kubernetesApiRef,
            new StubKubernetesClient([
              newTestHelmRepository(
                'podinfo',
                'https://stefanprodan.github.io/podinfo',
              ),
              newTestOCIRepository(
                'podinfo',
                'oci://ghcr.io/stefanprodan/manifests/podinfo',
                { verify: true, verified: true },
              ),
              newTestOCIRepository(
                'redis',
                'oci://registry-1.docker.io/bitnamicharts/redis',
              ),
              newTestOCIRepository(
                'postgresql',
                'oci://registry-1.docker.io/bitnamicharts/postgresql',
                { verify: true, verified: false },
              ),
              newTestOCIRepository(
                'apache',
                'oci://registry-1.docker.io/bitnamicharts/apache',
                { ready: false },
              ),
              newTestOCIRepository(
                'supabase',
                'oci://registry-1.docker.io/bitnamicharts/supabase',
                { verify: true, pending: true },
              ),
              newTestOCIRepository(
                'mariadb',
                'oci://registry-1.docker.io/bitnamicharts/mariadb',
                { verify: true, verified: false },
              ),
              newTestGitRepository(
                'podinfo',
                'https://github.com/stefanprodan/podinfo',
                { verify: true, verified: true },
              ),
              newTestGitRepository(
                'weave-gitops',
                'https://github.com/weaveworks/weave-gitops',
              ),
              newTestGitRepository(
                'weaveworks-backstage',
                'https://github.com/weaveworks/weaveworks-backstage',
                { verify: true, verified: false },
              ),
              newTestGitRepository(
                'weave-gitops-enterprise',
                'https://github.com/weaveworks/weave-gitops-enterprise',
              ),
            ]),
          ],

          [kubernetesAuthProvidersApiRef, new StubKubernetesAuthProvidersApi()],
        ]}
      >
        <EntityProvider entity={fakeEntity}>
          <Content>
            <FluxEntitySourcesCard />
          </Content>
        </EntityProvider>
      </TestApiProvider>
    ),
  })
  .registerPlugin(weaveworksFluxPlugin)
  .render();
