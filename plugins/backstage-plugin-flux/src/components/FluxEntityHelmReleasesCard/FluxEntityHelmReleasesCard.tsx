import React from 'react';

import { Progress } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { HelmRelease, theme } from '@weaveworks/weave-gitops';
import { ReactNode } from 'react';
import {
  QueryCache,
  QueryClient,
  QueryClientConfig,
  QueryClientProvider,
} from 'react-query';
import { ThemeProvider } from 'styled-components';
import { useHelmReleases } from '../../hooks/query';
import { FluxHelmReleasesTable, defaultColumns } from './FluxHelmReleasesTable';

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

const HelmReleaseSummary = ({ data }: { data: HelmRelease[] }) => {
  return (
    <FluxHelmReleasesTable
      helmReleases={data}
      isLoading={false}
      columns={defaultColumns}
    />
  );
};

const HelmReleasePanel = () => {
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

  return <HelmReleaseSummary data={data} />;
};

/**
 * Render the HelmReleases associated with the current Entity.
 *
 * @public
 */
export const FluxEntityHelmReleasesCard = () => (
  <WeaveGitOpsContext>
    <HelmReleasePanel />
  </WeaveGitOpsContext>
);
