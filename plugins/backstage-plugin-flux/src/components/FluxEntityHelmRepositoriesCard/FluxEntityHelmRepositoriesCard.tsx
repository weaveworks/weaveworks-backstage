import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useHelmRepositories } from '../../hooks';
import {
  FluxHelmRepositoriesTable,
  defaultColumns,
} from './FluxHelmRepositoriesTable';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';

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
    <>
      <h1>Helm Repositories</h1>
      <FluxHelmRepositoriesTable
        helmRepositories={data || []}
        isLoading={loading && !data}
        columns={defaultColumns}
      />
    </>
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
