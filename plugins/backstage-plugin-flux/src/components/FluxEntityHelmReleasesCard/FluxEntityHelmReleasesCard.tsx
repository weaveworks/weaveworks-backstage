import React from 'react';

import { Progress } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { HelmRelease } from '@weaveworks/weave-gitops';
import {
  FluxHelmReleasesTableContext,
  useHelmReleases,
} from '../../hooks/query';
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

  const [refreshInterval, setRefreshInterval] = React.useState(10000);

  const { data, loading, errors } = useHelmReleases(entity, refreshInterval);

  if (loading && !data) {
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

  return (
    <FluxHelmReleasesTableContext.Provider
      value={{ refreshInterval, setRefreshInterval }}
    >
      <HelmReleasesSummary data={data} />;
    </FluxHelmReleasesTableContext.Provider>
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
