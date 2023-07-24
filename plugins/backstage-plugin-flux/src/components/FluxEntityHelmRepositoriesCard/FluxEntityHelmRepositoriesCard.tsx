import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard } from '@backstage/core-components';
import { useHelmRepositories } from '../../hooks';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import {
  defaultColumns,
  FluxSourcesTable,
} from '../FluxEntitySourcesCard/FluxEntitySourcesTable';

const HelmRepositoriesPanel = () => {
  const { entity } = useEntity();
  const { data, loading, errors } = useHelmRepositories(entity);

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
    <InfoCard title="Helm Repositories">
      <FluxSourcesTable
        Sources={data || []}
        isLoading={loading && !data}
        columns={defaultColumns}
      />
    </InfoCard>
  );
};

/**
 * Render the HelmRepositories associated with the current Entity.
 *
 * @public
 */
export const FluxEntityHelmRepositoriesCard = () => (
  <WeaveGitOpsContext>
    <HelmRepositoriesPanel />
  </WeaveGitOpsContext>
);
