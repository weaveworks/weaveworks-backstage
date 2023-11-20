import React, { FC } from 'react';
import { InfoCard } from '@backstage/core-components';
import { FluxRuntimeTable, defaultColumns } from './FluxRuntimeTable';
import { useGetDeployments } from '../../hooks/useGetDeployments';
import theme from '../../theme';
import { ThemeProvider } from 'styled-components';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const FluxRuntimePanel: FC<{ many?: boolean }> = ({ many }) => {
  const { data, isLoading, error } = useGetDeployments();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <InfoCard title="Flux runtime">
      <FluxRuntimeTable
        deployments={data || []}
        isLoading={isLoading || !data}
        columns={defaultColumns}
        many={many}
      />
    </InfoCard>
  );
};

/**
 * Render the Deployments in Flux Runtime.
 *
 * @public
 */
export const FluxRuntimeCard = ({ many = true }: { many?: boolean }) => {
  // Set both the garbage collection time and max-age to 1 hour
  // gcTime should be higher than max-age to avoid removing things too soon.
  const gcTime = 1000 * 60 * 60;
  const maxAge = gcTime;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime,
      },
    },
  });

  const persister = createSyncStoragePersister({
    storage: window.localStorage,
  });

  return (
    <ThemeProvider theme={theme()}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge }}
      >
        <FluxRuntimePanel many={many} />
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
};
