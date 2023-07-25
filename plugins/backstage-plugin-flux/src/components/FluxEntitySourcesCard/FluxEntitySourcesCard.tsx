import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useFluxSources } from '../../hooks';
import {
  FluxSourcesTable,
  sourceDefaultColumns,
} from './FluxEntitySourcesTable';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { InfoCard } from '@backstage/core-components';

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
    <InfoCard title="Sources">
      <FluxSourcesTable
        sources={data || []}
        isLoading={loading && !data}
        columns={sourceDefaultColumns}
      />
    </InfoCard>
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
