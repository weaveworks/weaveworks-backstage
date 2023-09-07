import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard } from '@backstage/core-components';
import { useHelmReleases } from '../../hooks/query';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import {
  FluxDeploymentsTable,
  defaultColumns,
} from '../EntityFluxDeploymentsCard/FluxDeploymentsTable';

const HelmReleasePanel = ({ many }: { many?: boolean }) => {
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
    <InfoCard title="Helm Releases">
      <FluxDeploymentsTable
        deployments={data || []}
        isLoading={loading && !data}
        columns={defaultColumns}
        many={many}
      />
    </InfoCard>
  );
};

/**
 * Render the HelmReleases associated with the current Entity.
 *
 * @public
 */
export const EntityFluxHelmReleasesCard = ({
  many = true,
}: {
  many?: boolean;
}) => (
  <WeaveGitOpsContext>
    <HelmReleasePanel many={many} />
  </WeaveGitOpsContext>
);
