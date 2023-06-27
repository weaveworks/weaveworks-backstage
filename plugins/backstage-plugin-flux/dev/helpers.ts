import { DateTime} from 'luxon';
import * as verifiedOCIFixture from '../src/__fixtures__/verified_oci_repository.json';
import * as unVerifiedOCIFixture from '../src/__fixtures__/unverified_oci_repository.json';
import * as ociFixture from '../src/__fixtures__/oci_repository.json';
import { OCIRepository } from '../src/hooks/types'

const randomInt = (max: number) => Math.floor(Math.random() * max);

export const newTestOCIRepository = (name: string, url: string, verify: boolean = false, verified: boolean = false) => {
  let fixture = ociFixture;

  if (verify) {
    if (verified) {
      fixture = verifiedOCIFixture
    } else {
      fixture = unVerifiedOCIFixture
    }
  }

  fixture.spec.url = url;
  fixture.metadata.name = name;
  fixture.status.conditions[0].lastTransitionTime = DateTime.now().minus({hours:randomInt(22)+1}).toISO()!;

  return fixture;
}

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
          lastTransitionTime: DateTime.now().minus({hours:randomInt(22)+1}).toISO(),
          message: "Release reconciliation succeeded",
          reason: "ReconciliationSucceeded",
          status: ready,
          type: "Ready"
        },
        {
          lastTransitionTime: DateTime.now().minus({hours:randomInt(22)+1}).toISO(),
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