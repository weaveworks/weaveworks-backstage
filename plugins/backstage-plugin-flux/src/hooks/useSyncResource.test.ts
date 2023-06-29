import { KubernetesApi, kubernetesApiRef } from '@backstage/plugin-kubernetes';
import {
  getRequest,
  pathForResource,
  requestSyncResource,
  syncRequest,
} from './useSyncResource';

describe('pathForResource', () => {
  it('returns the correct path', () => {
    const name = 'test-name';
    const namespace = 'test-namespace';
    const gvk = {
      group: 'test-group',
      apiVersion: 'test-api-version',
      plural: 'test-plural',
    };

    expect(pathForResource(name, namespace, gvk)).toEqual(
      '/apis/test-group/test-api-version/namespaces/test-namespace/test-plural/test-name',
    );
  });
});

describe('syncRequest', () => {
  it('returns the correct request', () => {
    const name = 'test-name';
    const namespace = 'test-namespace';
    const clusterName = 'test-cluster-name';
    const gvk = {
      group: 'test-group',
      apiVersion: 'test-api-version',
      plural: 'test-plural',
    };
    const now = 'test-now';

    const expected = {
      clusterName: 'test-cluster-name',
      init: {
        body: `{"metadata":{"annotations":{"reconcile.fluxcd.io/requestedAt":"test-now"}}}`,
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
        method: 'PATCH',
      },
      path: '/apis/test-group/test-api-version/namespaces/test-namespace/test-plural/test-name',
    };

    expect(syncRequest(name, namespace, clusterName, gvk, now)).toEqual(
      expected,
    );
  });
});

describe('getRequest', () => {
  it('returns the correct request', () => {
    const name = 'test-name';
    const namespace = 'test-namespace';
    const clusterName = 'test-cluster-name';
    const gvk = {
      group: 'test-group',
      apiVersion: 'test-api-version',
      plural: 'test-plural',
    };

    const expected = {
      clusterName: 'test-cluster-name',
      path: '/apis/test-group/test-api-version/namespaces/test-namespace/test-plural/test-name',
    };

    expect(getRequest(name, namespace, clusterName, gvk)).toEqual(expected);
  });
});

function makeMockKubernetesApi() {
  const mockKubernetsApi: jest.Mocked<typeof kubernetesApiRef.T> = {
    getObjectsByEntity: jest.fn(),
    getClusters: jest.fn(),
    getWorkloadsByEntity: jest.fn(),
    getCustomObjectsByEntity: jest.fn(),
    proxy: jest.fn(),
  };
  return mockKubernetsApi;
}

describe('requestSyncResource', () => {
  it('resovles to undefined if everything goes okay', async () => {
    const kubernetesApi = makeMockKubernetesApi();
    // mock values in a sequence, first time the api is called return a 200
    // second time return a response body with the new lastHandledReconcileAt

    // Make the request
    kubernetesApi.proxy.mockResolvedValueOnce({
      ok: true,
    } as Response);

    kubernetesApi.proxy.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: {
            lastHandledReconcileAt: 'test-old',
          },
        }),
    } as Response);

    kubernetesApi.proxy.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: {
            lastHandledReconcileAt: 'test-now',
          },
        }),
    } as Response);

    const gvk = {
      group: 'test-group',
      apiVersion: 'test-api-version',
      plural: 'test-plural',
    };

    await expect(
      requestSyncResource(
        kubernetesApi,
        'test-name',
        'test-namespace',
        'test-cluster-name',
        gvk,
        'test-now',
        0, // 0ms for the test
      ),
    ).resolves.toBeUndefined();
  });

  it('throws an error if k8s api responds with not ok response', async () => {
    const kubernetesApi = makeMockKubernetesApi();
    kubernetesApi.proxy.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    } as Response);

    const gvk = {
      group: 'test-group',
      apiVersion: 'test-api-version',
      plural: 'test-plural',
    };

    await expect(
      requestSyncResource(
        kubernetesApi,
        'test-name',
        'test-namespace',
        'test-cluster-name',
        gvk,
        'test-now',
      ),
    ).rejects.toThrow('Failed to sync resource: 500 Internal Server Error');
  });
});
