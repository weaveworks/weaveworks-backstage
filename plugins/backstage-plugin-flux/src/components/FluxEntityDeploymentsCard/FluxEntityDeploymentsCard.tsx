import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
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
    <FluxDeploymentsTable
      kinds={['Kustomization', 'HelmRelease']}
      deployments={data || []}
      isLoading={loading && !data}
      columns={defaultColumns}
    />
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
