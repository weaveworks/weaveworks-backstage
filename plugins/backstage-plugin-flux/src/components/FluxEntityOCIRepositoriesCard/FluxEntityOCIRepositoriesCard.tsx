import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard } from '@backstage/core-components';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { useOCIRepositories } from '../../hooks';
import {
  defaultColumns,
  FluxSourcesTable,
} from '../FluxEntitySourcesCard/FluxEntitySourcesTable';

const OCIRepositoryPanel = () => {
  const { entity } = useEntity();
  const { data, loading, errors } = useOCIRepositories(entity);

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
    <InfoCard title="OCI Repositories">
      <FluxSourcesTable
        Sources={data || []}
        isLoading={loading && !data}
        columns={defaultColumns}
        title="OCI Repositories"
      />
    </InfoCard>
  );
};

/**
 * Render the OCIRepositories associated with the current Entity.
 *
 * @public
 */
export const FluxEntityOCIRepositoriesCard = () => (
  <WeaveGitOpsContext>
    <OCIRepositoryPanel />
  </WeaveGitOpsContext>
);
