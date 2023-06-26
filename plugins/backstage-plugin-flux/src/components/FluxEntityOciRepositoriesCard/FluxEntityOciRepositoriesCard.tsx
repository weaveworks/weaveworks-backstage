import React from 'react';
import { Progress } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  FluxOciRepositoriesTable,
  defaultColumns,
} from './FluxOciRepositoriesTable';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { useOciRepositories } from '../../hooks';

const OciRepositoryPanel = () => {
  const { entity } = useEntity();
  const { data, loading, errors } = useOciRepositories(entity);

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
    <FluxOciRepositoriesTable
      ociRepositories={data}
      isLoading={false}
      columns={defaultColumns}
    />
  );
};

/**
 * Render the OciRepositories associated with the current Entity.
 *
 * @public
 */
export const FluxEntityOciRepositoriesCard = () => (
  <WeaveGitOpsContext>
    <OciRepositoryPanel />
  </WeaveGitOpsContext>
);
