import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard } from '@backstage/core-components';
import { useGitRepositories } from '../../hooks/query';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import {
  defaultColumns,
  FluxSourcesTable,
} from '../FluxEntitySourcesCard/FluxEntitySourcesTable';

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
      <FluxSourcesTable
        Sources={data || []}
        isLoading={loading && !data}
        columns={defaultColumns}
        title="Git Repositories"
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
