import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard } from '@backstage/core-components';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { useFluxDeployments } from '../../hooks';
import { FluxDeploymentsTable, defaultColumns } from './FluxDeploymentsTable';

const DeploymentsPanel = () => {
  const { entity } = useEntity();
  const { data, loading, errors } = useFluxDeployments(entity);

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

  return (
    <InfoCard title="Deployments">
      <FluxDeploymentsTable
        deployments={data || []}
        isLoading={loading && !data}
        columns={defaultColumns}
      />
    </InfoCard>
  );
};

/**
 * Render the Deployments associated with the current Entity.
 *
 * @public
 */
export const FluxEntityDeploymentsCard = () => (
  <WeaveGitOpsContext>
    <DeploymentsPanel />
  </WeaveGitOpsContext>
);
