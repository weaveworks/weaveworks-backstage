import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard } from '@backstage/core-components';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { useKustomizations } from '../../hooks';
import {
  FluxDeploymentsTable,
  defaultColumns,
} from '../FluxEntityDeploymentsCard/FluxDeploymentsTable';

const KustomizationPanel = () => {
  const { entity } = useEntity();
  const { data, loading, errors } = useKustomizations(entity);

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
    <InfoCard title="Kustomizations">
      <FluxDeploymentsTable
        deployments={data || []}
        isLoading={loading && !data}
        columns={defaultColumns}
      />
    </InfoCard>
  );
};

/**
 * Render the Kustomizations associated with the current Entity.
 *
 * @public
 */
export const FluxEntityKustomizationsCard = () => (
  <WeaveGitOpsContext>
    <KustomizationPanel />
  </WeaveGitOpsContext>
);
