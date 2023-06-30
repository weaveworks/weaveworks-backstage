import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useHelmReleases } from '../../hooks/query';
import { FluxHelmReleasesTable, defaultColumns } from './FluxHelmReleasesTable';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';

const HelmReleasePanel = () => {
  const { entity } = useEntity();

  const { data, loading, errors } = useHelmReleases(entity);

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
    <FluxHelmReleasesTable
      helmReleases={data || []}
      isLoading={loading && !data}
      columns={defaultColumns}
    />
  );
};

/**
 * Render the HelmReleases associated with the current Entity.
 *
 * @public
 */
export const FluxEntityHelmReleasesCard = () => (
  <WeaveGitOpsContext>
    <HelmReleasePanel />
  </WeaveGitOpsContext>
);
