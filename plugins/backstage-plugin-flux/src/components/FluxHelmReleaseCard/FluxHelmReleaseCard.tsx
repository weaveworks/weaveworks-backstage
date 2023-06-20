import React from 'react';

import {
  InfoCard,
  InfoCardVariants,
  Progress,
  StructuredMetadataTable,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  HelmRelease,
  PageStatus,
  Timestamp,
  theme,
} from '@weaveworks/weave-gitops';
import { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { useWeaveFluxDeepLink } from '../../hooks';
import { useHelmReleases } from '../../hooks';
import { automationLastUpdated } from './utils';

export const WeaveGitOpsContext = ({ children }: { children: ReactNode }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const HelmReleaseSummary = ({
  helmRelease,
  variant,
}: {
  helmRelease: HelmRelease;
  variant?: InfoCardVariants;
}) => {
  const { name, namespace } = helmRelease;

  const metadata = {
    chartVersion: `${helmRelease.helmChart.chart}/${helmRelease.lastAppliedRevision}`,
    cluster: helmRelease.clusterName,
    lastUpdated: <Timestamp time={automationLastUpdated(helmRelease)} />,
  };

  const deepLink = useWeaveFluxDeepLink(helmRelease);

  return (
    <InfoCard
      title={
        <span>
          HelmRelease {namespace}/{name}
        </span>
      }
      variant={variant}
      subheader={
        <PageStatus conditions={helmRelease.conditions} suspended={helmRelease.suspended} />
      }
      deepLink={deepLink}
    >
      <StructuredMetadataTable metadata={metadata} />
    </InfoCard>
  );
};

type Props = {
  clusterName?: string;
  variant?: InfoCardVariants;
};

const HelmReleasePanel = (props: Props) => {
  const { entity } = useEntity();

  const { data, loading, errors } = useHelmReleases(entity);

  if (loading) {
    return <Progress />;
  }

  if (errors) {
    return (
      <div>
        Errors:
        <ul>
          {errors.map(err => (
            <li>{err.message}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (!data) {
    return <div>No HelmRelease found</div>;
  }

  return <HelmReleaseSummary variant={props.variant} helmRelease={data[0]} />;
};

export const FluxHelmReleaseCard = (props: Props) => (
  <WeaveGitOpsContext>
    <HelmReleasePanel {...props} />
  </WeaveGitOpsContext>
);
