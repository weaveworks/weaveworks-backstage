import React from 'react';

import { Progress } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { FluxOCIRepositoriesTable, defaultColumns } from './FluxOCIRepositoriesTable';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { useOCIRepositories } from '../../hooks';

const OCIRepositoryPanel = () => {
  const { entity } = useEntity();
  const { data, loading, errors } = useOCIRepositories(entity);

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
    return <div>No OCI Repositories found.</div>;
  }

  return (
    <FluxOCIRepositoriesTable
      ociRepositories={data}
      isLoading={false}
      columns={defaultColumns}
    />
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