import { kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { DEPLOYMENTS_PATH, getDeploymentsList } from './useGetDeployments';
import { FluxController } from '../objects';

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
    kubernetesApi.proxy.mockImplementation(async ({ init }) => {
      if (!init?.method) {
        return {
          ok: true,
          json: () =>
            Promise.resolve({
              kind: 'DeploymentList',
              apiVersion: 'apps/v1',
              items: [deployment],
            }),
        } as Response;
      } else
        return {
          ok: true,
          json: () => Promise.resolve(),
        } as Response;
    });

    await getDeploymentsList(kubernetesApi);

    // Assert we tried to GET the deployments for mock-cluster-1
    expect(kubernetesApi.proxy).toHaveBeenCalledWith({
      clusterName: 'mock-cluster-1',
      path: DEPLOYMENTS_PATH,
    });
  });
});
