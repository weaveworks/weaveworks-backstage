import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp } from '@backstage/test-utils';
import { FluxHelmReleaseCard } from './FluxHelmReleaseCard';
import { HelmRelease } from '@weaveworks/weave-gitops';
import { useHelmReleases } from '../../hooks';

jest.mock('../../hooks');

const testHelmRelease = {
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

describe('<FluxHelmReleaseCard />', () => {
  let Wrapper: React.ComponentType<React.PropsWithChildren<{}>>;

  beforeEach(() => {
    Wrapper = ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    );
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('shows the state of a HelmRelease', async () => {
    const entity: Entity = {
      apiVersion: 'v1',
      kind: 'Component',
      metadata: {
        name: 'my-name',
        annotations: {
          'backstage.io/kubernetes-id': 'testing-service',
        },
      },
    };

    (useHelmReleases as any).mockReturnValue({
      data: [
        new HelmRelease({
          payload: JSON.stringify(testHelmRelease),
        }),
      ],
    });

    const { getByText } = await renderInTestApp(
      <Wrapper>
        <EntityProvider entity={entity}>
          <FluxHelmReleaseCard />
        </EntityProvider>
      </Wrapper>,
    );

    expect(getByText(/kube-prometheus-stack/i)).toBeInTheDocument();
    expect(getByText(/HelmRelease default\/normal/i)).toBeInTheDocument();
  });
});
