import React, { FC } from 'react';
import { InfoCard } from '@backstage/core-components';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { FluxRuntimeTable, defaultColumns } from './FluxRuntimeTable';
import { useGetDeployments } from '../../hooks/useGetDeployments';

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
export const FluxRuntimeCard = ({ many = true }: { many?: boolean }) => (
  <WeaveGitOpsContext>
    <FluxRuntimePanel many={many} />
  </WeaveGitOpsContext>
);
