export const newTestOciRepository = (name: string, url: string) => {
    return {
      apiVersion: 'source.toolkit.fluxcd.io/v1beta2',
      kind: 'OCIRepository',
      metadata: {
        creationTimestamp: '2023-06-23T07:50:47Z',
        finalizers: [
          'finalizers.fluxcd.io'
        ],
        generation: 1,
        name: name,
        namespace: 'default',
        resourceVersion: '143955',
        uid: '1ec54278-ed2d-4f31-9bb0-39dc7163730e'
      },
      spec: {
        interval: '5m',
        provider: 'generic',
        timeout: '60s',
        url: url,
        verify: {
          provider: 'cosign'
        }
      },
      status: {
        artifact: {
          digest: 'sha256:62df151eb3714d9dfa943c7d88192d72466bffa268b25595f85530b793f77524',
          lastUpdateTime: '2023-06-23T07:50:53Z',
          metadata: {
            'org.opencontainers.image.created': '2023-05-03T14:30:58Z',
            'org.opencontainers.image.revision': '6.3.6/073f1ec5aff930bd3411d33534e91cbe23302324',
            'org.opencontainers.image.source': 'https://github.com/stefanprodan/podinfo'
          },
          path: 'ocirepository/default/podinfo/sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4.tar.gz',
          revision: 'latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4',
          size: 1071,
          url: 'http://source-controller.flux-system.svc.cluster.local./ocirepository/default/podinfo/sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4.tar.gz'
        },
        conditions: [
          {
            lastTransitionTime: '2023-06-23T07:50:53Z',
            message: "stored artifact for digest 'latest@sha256: 2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'",
            observedGeneration: 1,
            reason: 'Succeeded',
            status: 'True',
            type: 'Ready'
          },
          {
            lastTransitionTime: '2023-06 - 23T07: 50: 53Z',
            message: "stored artifact for digest 'latest @sha256: 2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'",
            observedGeneration: 1,
            reason: 'Succeeded',
            status: 'True',
            type: 'ArtifactInStorage'
          },
          {
            lastTransitionTime: '2023-06-23T07:50:52Z',
            message: "verified signature of revision latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'",
            observedGeneration: 1,
            reason: 'Succeeded',
            status: 'True',
            type: 'SourceVerified'
          }
        ],
        observedGeneration: 1,
        url: 'http://source-controller.flux-system.svc.cluster.local./ocirepository/default/podinfo/latest.tar.gz'
      }
    }
  };

  export const newTestHelmRelease = (name: string, chart: string, version: string, ready: string = "True") => {
    return {
      apiVersion: 'helm.toolkit.fluxcd.io/v2beta1',
      kind: 'HelmRelease',
      metadata: {
        annotations: {
          'metadata.weave.works/test': 'value',
        },
        creationTimestamp: '2023-05-25T14:14:46Z',
        finalizers: ['finalizers.fluxcd.io'],
        name: name,
        namespace: 'default',
      },
      spec: {
        interval: '5m',
        chart: {
          spec: {
            chart: chart,
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
            lastTransitionTime: "2023-06-16T12:48:22Z",
            message: "Release reconciliation succeeded",
            reason: "ReconciliationSucceeded",
            status: ready,
            type: "Ready"
          },
          {
            lastTransitionTime: "2023-06-16T12:48:22Z",
            message: "Helm upgrade succeeded",
            reason: "UpgradeSucceeded",
            status: "True",
            type: "Released"
          }
        ],
        helmChart: "default/default-podinfo",
        lastAppliedRevision: version,
        lastAttemptedRevision: version,
        lastAttemptedValuesChecksum: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
        lastReleaseRevision: 6,
        observedGeneration: 12
      },
    }
  };