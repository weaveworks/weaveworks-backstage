import { DateTime } from 'luxon';
import * as verifiedOCIRepository from '../src/__fixtures__/verified_oci_repository.json';
import * as unverifiedOCIRepository from '../src/__fixtures__/unverified_oci_repository.json';
import * as ociRepository from '../src/__fixtures__/oci_repository.json';
import * as verifiedGitRepository from '../src/__fixtures__/verified_git_repository.json';
import * as unverifiedGitRepository from '../src/__fixtures__/unverified_git_repository.json';
import * as gitRepository from '../src/__fixtures__/git_repository.json';
import { Condition } from '../src/objects';

const randomInt = (max: number) => Math.floor(Math.random() * max);

type RepoOpts = {
  verify?: boolean;
  verified?: boolean;
  pending?: boolean;
  ready?: boolean;
};

const copy = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj));
};

const removeVerifiedCondition = (conditions: Condition[]): Condition[]  => copy(conditions).filter((cond: Condition) => cond.type !== 'SourceVerified');

const applyReadyCondition = (status: boolean, conditions: Condition[]): Condition[] => {
  const ready = conditions.find(cond => cond.type === 'Ready');
  if (ready === undefined) {
    return conditions;
  }

  ready.status = Boolean(status) === true ? 'True' : 'False';
  const result = conditions.filter((cond: Condition) => cond.type !== 'Ready')
  result.unshift(ready);

  return result;
}

const configureFixture = (name: string, url: string, fixture: any, verifiedFixture: any, unverifiedFixture: any, opts?: RepoOpts) => {
  let result = copy(fixture);

  if (opts?.verify) {
    if (opts?.verified || opts?.pending) {
      result = copy(verifiedFixture);
    } else {
      result = copy(unverifiedFixture);
    }
  }

  if (opts?.verify && opts?.pending) {
    result.status.conditions = removeVerifiedCondition(result.status.conditions);
  }

  if (opts?.ready !== undefined) {
    result.status.conditions = applyReadyCondition(opts.ready!, result.status.conditions);
  }

  result.spec.url = url;
  result.metadata.name = name;
  result.status.conditions[0].lastTransitionTime = DateTime.now()
    .minus({ hours: randomInt(22) + 1 })
    .toISO()!;

  return result;
}

export const newTestOCIRepository = (
  name: string,
  url: string,
  opts?: RepoOpts
) => {
  return configureFixture(name, url, ociRepository, verifiedOCIRepository, unverifiedOCIRepository, opts);
};

export const newTestGitRepository = (
  name: string,
  url: string,
  opts?: RepoOpts
) => {
  return configureFixture(name, url, gitRepository, verifiedGitRepository, unverifiedGitRepository, opts);
};


export const newTestHelmRelease = (
  name: string,
  chart: string,
  version: string,
  ready: string = 'True',
) => {
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
          lastTransitionTime: DateTime.now()
            .minus({ hours: randomInt(22) + 1 })
            .toISO(),
          message: 'Release reconciliation succeeded',
          reason: 'ReconciliationSucceeded',
          status: ready,
          type: 'Ready',
        },
        {
          lastTransitionTime: DateTime.now()
            .minus({ hours: randomInt(22) + 1 })
            .toISO(),
          message: 'Helm upgrade succeeded',
          reason: 'UpgradeSucceeded',
          status: 'True',
          type: 'Released',
        },
      ],
      helmChart: 'default/default-podinfo',
      lastAppliedRevision: version,
      lastAttemptedRevision: version,
      lastAttemptedValuesChecksum: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
      lastReleaseRevision: 6,
      observedGeneration: 12,
    },
  };
};