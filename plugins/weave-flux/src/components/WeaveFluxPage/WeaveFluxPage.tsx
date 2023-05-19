import React from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import _ from 'lodash';
import {
  kubernetesApiRef,
  useCustomResources,
} from '@backstage/plugin-kubernetes';
import { CustomResourceMatcher } from '@backstage/plugin-kubernetes-common';

import {
  InfoCard,
  Progress,
  StructuredMetadataTable,
} from '@backstage/core-components';
import {
  QueryCache,
  QueryClient,
  QueryClientConfig,
  QueryClientProvider,
  useQuery,
} from 'react-query';
import {
  HelmRelease,
  Interval,
  PageStatus,
  theme,
  Timestamp,
} from '@weaveworks/weave-gitops';
import { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { useEntity } from '@backstage/plugin-catalog-react';

export const WeaveGitopsContext = ({ children }: { children: ReactNode }) => {
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

export function automationLastUpdated(a: HelmRelease): string {
  return _.get(_.find(a?.conditions, { type: 'Ready' }), 'timestamp') || '';
}

function weaveGitopsHelmReleaseLink(
  baseUrl: string,
  a: HelmRelease,
  clusterName: string,
): string {
  const queryStringData = {
    clusterName,
    name: a.name,
    namespace: a.namespace,
  };
  const queryString = Object.entries(queryStringData)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return `${baseUrl}/helm_release/details?${queryString}`;
}

const HelmReleaseSummary = ({
  data,
  clusterName,
}: {
  data: HelmRelease;
  clusterName: string;
}) => {
  const { name, namespace } = data;
  const metadata = {
    kind: data.type,
    chart: data.helmChart.chart,
    chartVersion: data.helmChart.version,
    lastAppliedRevision: data.lastAppliedRevision,
    lastAttemptedRevision: data.lastAttemptedRevision,
    interval: <Interval interval={data.interval} />,
    lastUpdated: <Timestamp time={automationLastUpdated(data)} />,
    name,
    namespace,
    sourceRef: `${data.sourceRef?.name || 'no-name'} (${
      data.sourceRef?.kind || 'no-kind'
    })`,
  };

  let header = (
    <span>
      HelmRelease {namespace}/{name}
    </span>
  );
  const config = useApi(configApiRef);
  const baseUrl = config.getOptionalString('gitops.baseUrl');
  if (baseUrl) {
    const href = weaveGitopsHelmReleaseLink(baseUrl, data, clusterName);
    header = <a href={href}>{header}</a>;
  }

  return (
    <InfoCard
      title={header}
      subheader={
        <PageStatus conditions={data.conditions} suspended={data.suspended} />
      }
    >
      <StructuredMetadataTable metadata={metadata} />
    </InfoCard>
  );
};

const useQueryCustomResource = (
  entity: Entity,
  customerResourceMatcher: CustomResourceMatcher,
  clusterName: string,
) => {
  const entityName =
    entity.metadata?.annotations?.['backstage.io/kubernetes-id'] ||
    entity.metadata?.name;

  const labelSelector: string =
    entity.metadata?.annotations?.['backstage.io/kubernetes-label-selector'] ||
    `backstage.io/kubernetes-id=${entityName}`;

  const namespace =
    entity.metadata?.annotations?.['backstage.io/kubernetes-namespace'];

  const basePath = [
    '/apis',
    customerResourceMatcher.group,
    customerResourceMatcher.apiVersion,
    ...(namespace ? [`namespaces/${namespace}`] : []),
    customerResourceMatcher.plural,
  ].join('/');
  const path = `${basePath}?labelSelector=${encodeURIComponent(labelSelector)}`;

  const kubernetesApi = useApi(kubernetesApiRef);
  return useQuery<HelmRelease, Error>(
    ['helmrelease', entityName, clusterName],
    async () => {
      const res = await kubernetesApi.proxy({ clusterName, path });
      if (!res.ok) {
        throw new Error(
          `Failed to fetch HelmRelease ${entityName}: ${res.statusText}`,
        );
      }
      const helmReleaseList = await res.json();
      if (!helmReleaseList.items.length) {
        throw new Error(`No HelmRelease found with name ${entityName}`);
      }
      const payload = JSON.stringify(helmReleaseList.items[0]);
      return new HelmRelease({ payload });
    },
    { retry: false, refetchInterval: 5000 },
  );
};

const HelmReleasePanel = () => {
  const clusterName = 'demo-cluster';
  const { entity } = useEntity();

  // Does not work without setting up some id provider
  // https://github.com/backstage/backstage/issues/12394
  //
  // const res = useCustomResources(entity, [
  //   {
  //     apiVersion: 'v2beta1',
  //     group: 'helm.toolkit.fluxcd.io',
  //     plural: 'helmreleases',
  //   },
  // ]);
  // console.log('res', res);

  const {
    data: helmRelease,
    isLoading,
    error,
  } = useQueryCustomResource(
    entity,
    {
      apiVersion: 'v2beta1',
      group: 'helm.toolkit.fluxcd.io',
      plural: 'helmreleases',
    },
    clusterName,
  );

  if (isLoading) {
    return <Progress />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!helmRelease) {
    return <div>No HelmRelease found</div>;
  }

  return <HelmReleaseSummary clusterName={clusterName} data={helmRelease} />;
};

export const WeaveFluxPage = () => (
  <Grid container spacing={4}>
    <Grid item xs={4}>
      <WeaveGitopsContext>
        <HelmReleasePanel />
      </WeaveGitopsContext>
    </Grid>
  </Grid>
);
