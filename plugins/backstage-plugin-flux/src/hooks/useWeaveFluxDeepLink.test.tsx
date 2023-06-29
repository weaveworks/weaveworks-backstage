import { ConfigApi, configApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';
import { renderHook } from '@testing-library/react-hooks';
import React, { PropsWithChildren } from 'react';
import { useWeaveFluxDeepLink } from './useWeaveFluxDeepLink';
import { GitRepository, HelmRelease, OCIRepository } from '../objects';

const testHelmRelease = new HelmRelease({
  payload:
    '{"apiVersion":"helm.toolkit.fluxcd.io/v2beta1","kind":"HelmRelease","metadata":{"annotations":{"metadata.weave.works/test":"value"},"creationTimestamp":"2023-05-25T14:14:46Z","finalizers":["finalizers.fluxcd.io"],"generation":5,"name":"normal","namespace":"default","resourceVersion":"1","uid":"82231842-2224-4f22-8576-5babf08d746d"}}',
});
const testGitRepository = new GitRepository({
  payload:
    '{"apiVersion":"source.toolkit.fluxcd.io/v1","kind":"GitRepository","metadata":{"creationTimestamp":"2023-06-22T17:58:23Z","finalizers":["finalizers.fluxcd.io"],"generation":1,"name":"podinfo","namespace":"default","resourceVersion":"137468","uid":"068ec137-b2a0-4b35-90ea-4e9a8a2fe5f6"},"spec":{"interval":"1m","ref":{"branch":"master"},"timeout":"60s","url":"https://github.com/stefanprodan/podinfo"},"status":{"artifact":{"digest":"sha256:f1e2d4a8244772c47d5e10b38768acec57dc404d6409464c15d2eb8c84b28b51","lastUpdateTime":"2023-06-22T17:58:24Z","path":"gitrepository/default/podinfo/e06a5517daf5ac8c5ba74a97135499e40624885a.tar.gz","revision":"master@sha1:e06a5517daf5ac8c5ba74a97135499e40624885a","size":80053,"url":"http://source-controller.flux-system.svc.cluster.local./gitrepository/default/podinfo/e06a5517daf5ac8c5ba74a97135499e40624885a.tar.gz"},"conditions":[{"lastTransitionTime":"2023-06-23T06:58:24Z","message":"stored artifact for revision \'master@sha1:e06a5517daf5ac8c5ba74a97135499e40624885a\'","observedGeneration":1,"reason":"Succeeded","status":"True","type":"Ready"},{"lastTransitionTime":"2023-06-22T17:58:24Z","message":"stored artifact for revision \'master@sha1:e06a5517daf5ac8c5ba74a97135499e40624885a\'","observedGeneration":1,"reason":"Succeeded","status":"True","type":"ArtifactInStorage"}],"observedGeneration":1}}',
});
const testOCIRepository = new OCIRepository({
  payload: `{"apiVersion":"source.toolkit.fluxcd.io/v1beta2","kind":"OCIRepository","metadata":{"creationTimestamp":"2023-06-23T07:50:47Z","finalizers":["finalizers.fluxcd.io"],"generation":1,"name":"podinfo","namespace":"default","resourceVersion":"143955","uid":"1ec54278-ed2d-4f31-9bb0-39dc7163730e"},"spec":{"interval":"5m","provider":"generic","timeout":"60s","url":"oci://ghcr.io/stefanprodan/manifests/podinfo","verify":{"provider":"cosign"}},"status":{"artifact":{"digest":"sha256:62df151eb3714d9dfa943c7d88192d72466bffa268b25595f85530b793f77524","lastUpdateTime":"2023-06-23T07:50:53Z","metadata":{"org.opencontainers.image.created":"2023-05-03T14:30:58Z","org.opencontainers.image.revision":"6.3.6/073f1ec5aff930bd3411d33534e91cbe23302324","org.opencontainers.image.source":"https://github.com/stefanprodan/podinfo"},"path":"ocirepository/default/podinfo/sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4.tar.gz","revision":"latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4","size":1071,"url":"http://source-controller.flux-system.svc.cluster.local./ocirepository/default/podinfo/sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4.tar.gz"},"conditions":[{"lastTransitionTime":"2023-06-23T07:50:53Z","message":"stored artifact for digest 'latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'","observedGeneration":1,"reason":"Succeeded","status":"True","type":"Ready"},{"lastTransitionTime":"2023-06-23T07:50:53Z","message":"stored artifact for digest 'latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'","observedGeneration":1,"reason":"Succeeded","status":"True","type":"ArtifactInStorage"}],"observedGeneration":1,"url":"http://source-controller.flux-system.svc.cluster.local./ocirepository/default/podinfo/latest.tar.gz"}}`,
});

let gitOpsUrl: string | undefined;
const mockConfigApi = {
  getOptionalString: jest.fn(() => gitOpsUrl),
} as Partial<ConfigApi>;

const wrapper = ({ children }: PropsWithChildren<{}>) => {
  return (
    <TestApiProvider apis={[[configApiRef, mockConfigApi]]}>
      {children}
    </TestApiProvider>
  );
};

describe('useWeaveFluxDeepLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gitOpsUrl = undefined;
  });

  describe('when configured with a gitops url', () => {
    it('calculates a url for HelmReleases', async () => {
      gitOpsUrl = 'https://example.com';

      const { result } = renderHook(
        () => useWeaveFluxDeepLink(testHelmRelease),
        {
          wrapper,
        },
      );
      expect(result.current).toBe(
        'https://example.com/helm_release/details?clusterName=&name=normal&namespace=default',
      );
    });

    it('calculates a url for GitRepositories', async () => {
      gitOpsUrl = 'https://example.com';

      const { result } = renderHook(
        () => useWeaveFluxDeepLink(testGitRepository),
        {
          wrapper,
        },
      );
      expect(result.current).toBe(
        'https://example.com/git_repo/details?clusterName=&name=podinfo&namespace=default',
      );
    });

    it('calculates a url for OCIRepositories', async () => {
      gitOpsUrl = 'https://example.com';

      const { result } = renderHook(
        () => useWeaveFluxDeepLink(testOCIRepository),
        {
          wrapper,
        },
      );
      expect(result.current).toBe(
        'https://example.com/oci/details?clusterName=&name=podinfo&namespace=default',
      );
    });
  });

  describe('when configured without a gitops url', () => {
    it('returns undefined', async () => {
      const { result } = renderHook(
        () => useWeaveFluxDeepLink(testHelmRelease),
        {
          wrapper,
        },
      );
      expect(result.current).toBeUndefined();
    });
  });
});
