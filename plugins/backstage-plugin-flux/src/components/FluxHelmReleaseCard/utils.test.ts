import { automationLastUpdated } from './utils';
import {
  HelmRelease,
} from '@weaveworks/weave-gitops';

describe('automationLastUpdated', () => {
  it('returns an empty string when no conditions', () => {
    const latest = automationLastUpdated(new HelmRelease({ payload: '{"apiVersion":"helm.toolkit.fluxcd.io/v2beta1","kind":"HelmRelease","metadata":{"annotations":{"metadata.weave.works/test":"value"},"creationTimestamp":"2023-05-25T14:14:46Z","finalizers":["finalizers.fluxcd.io"],"generation":5,"name":"normal","namespace":"default","resourceVersion":"1","uid":"82231842-2224-4f22-8576-5babf08d746d"}}' } ));

    expect(latest).toEqual('');
  });

  it('returns the timestamp of the first Ready condition', () => {
    const latest = automationLastUpdated(new HelmRelease({ payload: '{"apiVersion":"helm.toolkit.fluxcd.io/v2beta1","kind":"HelmRelease","metadata":{"annotations":{"metadata.weave.works/test":"value"},"creationTimestamp":"2023-05-25T14:14:46Z","finalizers":["finalizers.fluxcd.io"],"generation":5,"name":"normal","namespace":"default","resourceVersion":"1","uid":"82231842-2224-4f22-8576-5babf08d746d"},"status":{"conditions":[{"lastTransitionTime":"2023-05-25T15:03:33Z","message":"pulled \'test\' chart with version \'1.0.0\'","observedGeneration":1,"reason":"ChartPullSucceeded","status":"True","type":"Ready"}]}}' } ));

    expect(latest).toEqual('2023-05-25T15:03:33Z');
  });


  it('returns the timestamp even when the condition is not Ready', () => {
    const latest = automationLastUpdated(new HelmRelease({ payload: '{"apiVersion":"helm.toolkit.fluxcd.io/v2beta1","kind":"HelmRelease","metadata":{"annotations":{"metadata.weave.works/test":"value"},"creationTimestamp":"2023-05-25T14:14:46Z","finalizers":["finalizers.fluxcd.io"],"generation":5,"name":"normal","namespace":"default","resourceVersion":"1","uid":"82231842-2224-4f22-8576-5babf08d746d"},"status":{"conditions":[{"lastTransitionTime":"2023-05-25T15:03:33Z","message":"pulled \'test\' chart with version \'1.0.0\'","observedGeneration":1,"reason":"ChartPullSucceeded","status":"False","type":"Ready"}]}}' } ));

    expect(latest).toEqual('2023-05-25T15:03:33Z');
  });
});
