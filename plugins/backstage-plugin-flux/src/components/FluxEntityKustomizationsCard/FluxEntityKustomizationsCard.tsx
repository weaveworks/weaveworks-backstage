import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { useKustomizations } from '../../hooks';
import {
  FluxKustomizationsTable,
  defaultColumns,
} from './FluxKustomizationsTable';

const KustomizationPanel = () => {
  const { entity } = useEntity();
  const { data, loading, errors } = useKustomizations(entity);

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
    <FluxKustomizationsTable
      kustomizations={data || []}
      isLoading={loading && !data}
      columns={defaultColumns}
    />
  );
};

/**
 * Render the Kustomizations associated with the current Entity.
 *
 * @public
 */
export const FluxEntityKustomizationsCard = () => (
  <WeaveGitOpsContext>
    <KustomizationPanel />
  </WeaveGitOpsContext>
);
