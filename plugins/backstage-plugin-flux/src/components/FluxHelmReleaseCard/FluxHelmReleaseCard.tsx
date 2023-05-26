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
import {
  QueryCache,
  QueryClient,
  QueryClientConfig,
  QueryClientProvider,
} from 'react-query';
import { ThemeProvider } from 'styled-components';
import { useWeaveFluxDeepLink } from '../../hooks/external-link';
import { useQueryHelmRelease } from '../../hooks/query';
import { automationLastUpdated } from './utils';

export const WeaveGitOpsContext = ({ children }: { children: ReactNode }) => {
  const queryOptions: QueryClientConfig = {
    queryCache: new QueryCache(),
  };
  const queryClient = new QueryClient(queryOptions);

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
};

const HelmReleaseSummary = ({
  data,
  clusterName,
  variant,
}: {
  data: HelmRelease;
  clusterName: string;
  variant?: InfoCardVariants;
}) => {
  const { name, namespace } = data;
  const metadata = {
    chartVersion: `${data.helmChart.chart}/${data.lastAppliedRevision}`,
    cluster: clusterName,
    lastUpdated: <Timestamp time={automationLastUpdated(data)} />,
  };

  const deepLink = useWeaveFluxDeepLink(data, clusterName);

  return (
    <InfoCard
      title={
        <span>
          HelmRelease {namespace}/{name}
        </span>
      }
      variant={variant}
      subheader={
        <PageStatus conditions={data.conditions} suspended={data.suspended} />
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
  const clusterName = props.clusterName || 'demo-cluster';

  const { data, isLoading, error } = useQueryHelmRelease(entity, clusterName);

  if (isLoading) {
    return <Progress />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>No HelmRelease found</div>;
  }

  return (
    <HelmReleaseSummary
      variant={props.variant}
      clusterName={clusterName}
      data={data}
    />
  );
};

export const FluxHelmReleaseCard = (props: Props) => (
  <WeaveGitOpsContext>
    <HelmReleasePanel {...props} />
  </WeaveGitOpsContext>
);
