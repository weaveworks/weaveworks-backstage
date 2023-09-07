import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard, TableColumn } from '@backstage/core-components';
import { useGitRepositories } from '../../hooks/query';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import {
  gitOciDefaultColumns,
  FluxSourcesTable,
} from '../EntityFluxSourcesCard/FluxSourcesTable';
import { Source } from '../helpers';

const GitRepositoriesPanel = ({ many }: { many?: boolean }) => {
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
        sources={data || []}
        isLoading={loading && !data}
        columns={gitOciDefaultColumns as TableColumn<Source>[]}
        many={many}
      />
    </InfoCard>
  );
};

/**
 * Render the GitRepositories associated with the current Entity.
 *
 * @public
 */
export const EntityFluxGitRepositoriesCard = ({
  many = true,
}: {
  many?: boolean;
}) => (
  <WeaveGitOpsContext>
    <GitRepositoriesPanel many={many} />
  </WeaveGitOpsContext>
);
