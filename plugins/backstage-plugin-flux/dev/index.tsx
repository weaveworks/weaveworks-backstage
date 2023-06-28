import React from 'react';
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
} from '../src/plugin';
import { newTestHelmRelease, newTestOCIRepository } from './helpers';
import { FluxEntityOCIRepositoriesCard } from '../src/components/FluxEntityOCIRepositoriesCard';

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

const fakeGitRepository = {
  apiVersion: 'source.toolkit.fluxcd.io/v1',
  kind: 'GitRepository',
  metadata: {
    creationTimestamp: '2023-06-22T17:58:23Z',
    finalizers: ['finalizers.fluxcd.io'],
    generation: 1,
    name: 'podinfo',
    namespace: 'default',
    resourceVersion: '132764',
    uid: '068ec137-b2a0-4b35-90ea-4e9a8a2fe5f6',
  },
  spec: {
    interval: '1m',
    ref: {
      branch: 'master',
    },
    timeout: '60s',
    url: 'https://github.com/stefanprodan/podinfo',
  },
  status: {
    artifact: {
      digest:
        'sha256:f1e2d4a8244772c47d5e10b38768acec57dc404d6409464c15d2eb8c84b28b51',
      lastUpdateTime: '2023-06-22T17:58:24Z',
      path: 'gitrepository/default/podinfo/e06a5517daf5ac8c5ba74a97135499e40624885a.tar.gz',
      revision: 'master@sha1:e06a5517daf5ac8c5ba74a97135499e40624885a',
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

class StubKubernetesClient implements KubernetesApi {
  private resources: any[];

  constructor(resources: any[]) {
    this.resources = resources;
  }

  getObjectsByEntity(
    _: KubernetesRequestBody,
  ): Promise<ObjectsByEntityResponse> {
    throw new Error('getObjectsByEntityMethod not implemented.');
  }

  async getClusters(): Promise<{ name: string; authProvider: string }[]> {
    return [{ name: 'mock-cluster', authProvider: 'serviceAccount' }];
  }

  getWorkloadsByEntity(
    _: WorkloadsByEntityRequest,
  ): Promise<ObjectsByEntityResponse> {
    throw new Error('getWorkloadsByEntityMethod not implemented.');
  }
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
              resources: this.resources,
            },
          ],
        },
      ],
    });
  }
  async proxy(_options: {
    clusterName: string;
    path: string;
    init?: RequestInit | undefined;
  }): Promise<any> {
    throw new Error('proxy not implemented.');
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
          <FluxEntityHelmReleasesCard />
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
          [kubernetesApiRef, new StubKubernetesClient([fakeGitRepository])],
          [kubernetesAuthProvidersApiRef, new StubKubernetesAuthProvidersApi()],
        ]}
      >
        <EntityProvider entity={fakeEntity}>
          <FluxEntityGitRepositoriesCard />
        </EntityProvider>
      </TestApiProvider>
    ),
  })
  .addPage({
    title: 'Oci Repositories',
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
                true,
                true,
              ),
              newTestOCIRepository(
                'redis',
                'oci://registry-1.docker.io/bitnamicharts/redis',
              ),
              newTestOCIRepository(
                'postgresql',
                'oci://registry-1.docker.io/bitnamicharts/postgresql',
                true,
                false,
              ),
              newTestOCIRepository(
                'apache',
                'oci://registry-1.docker.io/bitnamicharts/apache',
              ),
              newTestOCIRepository(
                'supabase',
                'oci://registry-1.docker.io/bitnamicharts/supabase',
              ),
              newTestOCIRepository(
                'mariadb',
                'oci://registry-1.docker.io/bitnamicharts/mariadb',
                true,
                false,
              ),
            ]),
          ],

          [kubernetesAuthProvidersApiRef, new StubKubernetesAuthProvidersApi()],
        ]}
      >
        <EntityProvider entity={fakeEntity}>
          <FluxEntityOCIRepositoriesCard />
        </EntityProvider>
      </TestApiProvider>
    ),
  })
  .registerPlugin(weaveworksFluxPlugin)
  .render();
