import React from 'react';
import { Progress } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { useOCIRepositories } from '../../hooks';
import {
  FluxOCIRepositoriesTable,
  defaultColumns,
} from './FluxOciRepositoriesTable';

const OCIRepositoryPanel = () => {
  const { entity } = useEntity();
  const { data, loading, errors } = useOCIRepositories(entity);

  if (loading && !data) {
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
