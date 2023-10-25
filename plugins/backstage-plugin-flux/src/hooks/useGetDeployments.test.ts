import { kubernetesApiRef } from '@backstage/plugin-kubernetes';
import {
  NAMESPACES_PATH,
  getDeploymentsList,
  getDeploymentsPath,
} from './useGetDeployments';
import { FluxController, Namespace } from '../objects';

function makeMockKubernetesApi() {
  return {
    getObjectsByEntity: jest.fn(),
    getClusters: jest.fn(),
    getWorkloadsByEntity: jest.fn(),
    getCustomObjectsByEntity: jest.fn(),
    proxy: jest.fn(),
  } as jest.Mocked<typeof kubernetesApiRef.T>;
}

describe('getDeploymentsList', () => {
  const namespace = {
    name: 'flux-system',
    uid: '1dcca7cb-c651-4a86-93b4-ecf440df2353',
    resourceVersion: '1583',
    creationTimestamp: '2023-10-19T16:34:12Z',
    labels: {
      'app.kubernetes.io/instance': 'flux-system',
      'app.kubernetes.io/part-of': 'flux',
      'app.kubernetes.io/version': 'v2.0.0',
      'kubernetes.io/metadata.name': 'flux-system',
      'kustomize.toolkit.fluxcd.io/name': 'flux-system',
      'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
      'pod-security.kubernetes.io/warn': 'restricted',
      'pod-security.kubernetes.io/warn-version': 'latest',
    },
  } as Namespace;
  const deployment = {
    name: 'image-automation-controller',
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
    images: ['ghcr.io/fluxcd/image-automation-controller:v0.36.1'],
    suspended: false,
    clusterName: 'mock-cluster-1',
    uid: '4527e05c-eed4-489d-93ae-0cd66ca3277e',
    labels: {
      'app.kubernetes.io/component': 'image-automation-controller',
      'app.kubernetes.io/instance': 'flux-system',
      'app.kubernetes.io/part-of': 'flux',
      'app.kubernetes.io/version': 'v2.1.2',
      'control-plane': 'controller',
      'kustomize.toolkit.fluxcd.io/name': 'flux-system',
      'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
    },
  } as FluxController;

  it('should get a Deployments list', async () => {
    const kubernetesApi = makeMockKubernetesApi();

    kubernetesApi.getClusters.mockImplementation(async () => {
      return [{ name: 'mock-cluster-1', authProvider: 'serviceAccount1' }];
    });

    kubernetesApi.proxy.mockImplementation(
      async ({ init, path, clusterName }) => {
        if (!init?.method && path === NAMESPACES_PATH) {
          if (clusterName === 'mock-cluster-1') {
            return {
              ok: true,
              json: () =>
                Promise.resolve({
                  kind: 'NamespacesList',
                  apiVersion: 'meta.k8s.io/v1',
                  items: [namespace],
                }),
            } as Response;
          }
        }
        if (!init?.method && path === getDeploymentsPath('flux-system')) {
          return {
            ok: true,
            json: () =>
              Promise.resolve({
                kind: 'DeploymentList',
                apiVersion: 'apps/v1',
                items: [deployment],
              }),
          } as Response;
        }
        return {
          ok: true,
          json: () => Promise.resolve(),
        } as Response;
      },
    );

    await getDeploymentsList(kubernetesApi);

    // Assert we tried to GET the namespaces that exist in the clusters
    expect(kubernetesApi.proxy).toHaveBeenCalledWith({
      clusterName: 'mock-cluster-1',
      path: NAMESPACES_PATH,
    });

    // Assert we tried to GET the deployments for mock-cluster-1
    expect(kubernetesApi.proxy).toHaveBeenCalledWith({
      clusterName: 'mock-cluster-1',
      path: getDeploymentsPath('flux-system'),
    });
  });
});
