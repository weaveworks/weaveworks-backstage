import React from 'react';

import { Progress } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { HelmRelease } from '@weaveworks/weave-gitops';
import { useHelmReleases } from '../../hooks/query';
import { FluxHelmReleasesTable, defaultColumns } from './FluxHelmReleasesTable';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';

const HelmReleasesSummary = ({ data }: { data: HelmRelease[] }) => {
  return (
    <FluxHelmReleasesTable
      helmReleases={data}
      isLoading={false}
      columns={defaultColumns}
    />
  );
};

const HelmReleasePanel = () => {
  const { entity } = useEntity();

  const { data, loading, errors } = useHelmReleases(entity);

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
    return <div>No HelmRelease found</div>;
  }

  return <HelmReleasesSummary data={data} />;
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
