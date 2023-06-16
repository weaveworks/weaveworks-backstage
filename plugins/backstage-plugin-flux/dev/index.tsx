import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { KubernetesApi, kubernetesApiRef } from '@backstage/plugin-kubernetes';
import {
  KubernetesRequestBody,
  ObjectsByEntityResponse,
  WorkloadsByEntityRequest,
  CustomObjectsByEntityRequest
} from '@backstage/plugin-kubernetes-common';

import { weaveworksFluxPlugin, FluxHelmReleaseCard } from '../src/plugin';
import { HelmRelease } from '@weaveworks/weave-gitops';

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

const fakeHelmRelease: HelmRelease = {
  apiVersion: 'helm.toolkit.fluxcd.io/v2beta1',
  kind: 'HelmRelease',
  metadata: {
    annotations: {
      'metadata.weave.works/test': 'value',
    },
    creationTimestamp: '2023-05-25T14:14:46Z',
    finalizers: ['finalizers.fluxcd.io'],
    name: 'normal',
    namespace: 'default',
  },
  spec: {
    interval: '5m',
    chart: {
      spec: {
        chart: 'kube-prometheus-stack',
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

class StubKubernetesClient implements KubernetesApi {
  getObjectsByEntity(_: KubernetesRequestBody): Promise<ObjectsByEntityResponse> {
    throw new Error('getObjectsByEntityMethod not implemented.');
  }
  getClusters(): Promise<{ name: string; authProvider: string; oidcTokenProvider?: string | undefined; }[]> {
    throw new Error('getClustersMethod not implemented.');
  }
  getWorkloadsByEntity(_: WorkloadsByEntityRequest): Promise<ObjectsByEntityResponse> {
    throw new Error('getWorkloadsByEntityMethod not implemented.');
  }
  getCustomObjectsByEntity(_: CustomObjectsByEntityRequest): Promise<ObjectsByEntityResponse> {
    throw new Error('getCustomObjectsByEntity Method not implemented.');
  }
  async proxy(_options: { clusterName: string; path: string; init?: RequestInit | undefined; }): Promise<any> {
    return { ok: true, json: () => Promise.resolve({ items: [fakeHelmRelease] }) };
  }
};

createDevApp()
  .registerApi({
    api: kubernetesApiRef,
    deps: {},
    factory: () => new StubKubernetesClient(),
  })
  .registerPlugin(weaveworksFluxPlugin)
  .addPage({
    title: 'Root Page',
    path: '/weaveworks-flux',
    element: (
      <EntityProvider entity={fakeEntity}>
        <FluxHelmReleaseCard />
      </EntityProvider>
    ),
  })
  .render();
