import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useHelmReleases } from '../../hooks/query';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import {
  FluxDeploymentsTable,
  defaultColumns,
} from '../FluxEntityDeploymentsCard/FluxDeploymentsTable';

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
    <>
      <h1>Helm Releases</h1>
      <FluxDeploymentsTable
        deployments={data || []}
        isLoading={loading && !data}
        columns={defaultColumns}
      />
    </>
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
