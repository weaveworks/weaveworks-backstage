import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useFluxSources } from '../../hooks';
import { FluxSourcesTable, defaultColumns } from './FluxEntitySourcesTable';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';

const SourcesPanel = () => {
  const { entity } = useEntity();
  const { data, loading, errors } = useFluxSources(entity);

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
    <FluxSourcesTable
      Sources={data || []}
      isLoading={loading && !data}
      columns={defaultColumns}
      title="Sources"
    />
  );
};

/**
 * Render the Source associated with the current Entity.
 *
 * @public
 */
export const FluxEntitySourcesCard = () => (
  <WeaveGitOpsContext>
    <SourcesPanel />
  </WeaveGitOpsContext>
);
