import React from 'react';
import { Progress } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useGitRepositories } from '../../hooks/query';
import {
  FluxGitRepositoriesTable,
  defaultColumns,
} from './FluxGitRepositoriesTable';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { GitRepository } from '../../objects';

const GitRepositoriesSummary = ({ data }: { data: GitRepository[] }) => {
  return (
    <FluxGitRepositoriesTable
      gitRepositories={data}
      isLoading={false}
      columns={defaultColumns}
    />
  );
};

const GitRepositoriesPanel = () => {
  const { entity } = useEntity();
  const { data, loading, errors } = useGitRepositories(entity);

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
    return <div>No Git Repositories found for this entity.</div>;
  }

  return <GitRepositoriesSummary data={data} />;
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
