import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard } from '@backstage/core-components';
import { useGitRepositories } from '../../hooks/query';
import {
  FluxGitRepositoriesTable,
  defaultColumns,
} from './FluxGitRepositoriesTable';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';

const GitRepositoriesPanel = () => {
  const { entity } = useEntity();
  const { data, loading, errors } = useGitRepositories(entity);

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
    <InfoCard title="Git Repositories">
      <FluxGitRepositoriesTable
        gitRepositories={data || []}
        isLoading={loading && !data}
        columns={defaultColumns}
      />
    </InfoCard>
  );
};

/**
 * Render the GitRepositories associated with the current Entity.
 *
 * @public
 */
export const FluxEntityGitRepositoriesCard = () => (
  <WeaveGitOpsContext>
    <GitRepositoriesPanel />
  </WeaveGitOpsContext>
);
