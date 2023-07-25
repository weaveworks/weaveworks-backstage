import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard } from '@backstage/core-components';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { useOCIRepositories } from '../../hooks';
import {
  FluxOCIRepositoriesTable,
  defaultColumns,
} from './FluxOCIRepositoriesTable';

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
      <FluxOCIRepositoriesTable
        ociRepositories={data || []}
        isLoading={loading && !data}
        columns={defaultColumns}
        many={true}
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
