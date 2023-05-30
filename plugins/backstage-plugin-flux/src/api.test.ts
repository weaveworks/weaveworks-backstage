import { Entity } from '@backstage/catalog-model';
import { FluxClient, kubernetesIdOrNameFromEntity } from './api';
import { KubernetesApi } from '@backstage/plugin-kubernetes';
import { HelmRelease } from '@weaveworks/weave-gitops';

const newEntity = (name: string): Entity => {
  return {
    apiVersion: 'backstage.io/v1beta1',
    kind: 'Component',
    metadata: { name: name, annotations: {} },
    spec: {
      type: 'service',
      lifecycle: 'production',
      owner: 'sockshop-team',
      system: 'carts'
    }
  };
}

describe('kubernetesIdOrNameFromEntity', () => {
  it('returns the name when the kubernete-id does not exist', () => {
    const name = kubernetesIdOrNameFromEntity(newEntity('testing'));

    expect(name).toEqual('testing');
  });

  it('returns the annotation when the kubernetes-id exists', () => {
    const entity = newEntity('testing');
    entity.metadata.annotations = { 'backstage.io/kubernetes-id': 'test-kubernetes-id' };

    const name = kubernetesIdOrNameFromEntity(entity);

    expect(name).toEqual('test-kubernetes-id');
  });

  it('returns the name when the kubernetes-id exists but is empty', () => {
    const entity = newEntity('testing');
    entity.metadata.annotations = { 'backstage.io/kubernetes-id': '' };

    const name = kubernetesIdOrNameFromEntity(entity);

    expect(name).toEqual('testing');
  });
});

describe('FluxClient', () => {
  const callProxyMock = jest.fn();
  const mockKubernetesApi: jest.Mocked<KubernetesApi> = {
    proxy: callProxyMock,
    getCustomObjectsByEntity: jest.fn(),
    getWorkloadsByEntity: jest.fn(),
    getObjectsByEntity: jest.fn(),
    getClusters: jest.fn(),
  };

  const newHelmReleaseResponse = (name: string): any => {
    return {
      apiVersion: 'helm.toolkit.fluxcd.io/v2beta1',
      kind: 'HelmRelease',
      metadata: {
        annotations: {
          'metadata.weave.works/test': 'value',
        },
        finalizers: ['finalizers.fluxcd.io'],
        name: name,
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
      }
    };
  }

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('getHelmReleaseInCluster returns a HelmRelease', async () => {
    const helmRelease = newHelmReleaseResponse('testing');

    const entity = newEntity('testing');
    entity.metadata.annotations = { 'backstage.io/kubernetes-id': 'test-kubernetes-id' };

    const fluxClient = new FluxClient({ kubernetesApi: mockKubernetesApi });
    callProxyMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ items: [helmRelease, newHelmReleaseResponse('test-1')] }),
    });

    const result = await fluxClient.getHelmReleaseInCluster('testing', entity);

    expect(result).toEqual(new HelmRelease({ payload: JSON.stringify(helmRelease) }));
    expect(callProxyMock).toHaveBeenCalledWith({
      clusterName: 'testing',
      path: '/apis/helm.toolkit.fluxcd.io/v2beta1/helmreleases?labelSelector=backstage.io%2Fkubernetes-id%3Dtest-kubernetes-id'
    });
  });
});