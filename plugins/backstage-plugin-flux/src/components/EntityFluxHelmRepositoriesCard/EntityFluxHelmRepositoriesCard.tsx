import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard, TableColumn } from '@backstage/core-components';
import { useHelmRepositories } from '../../hooks';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import {
  helmDefaultColumns,
  FluxSourcesTable,
} from '../EntityFluxSourcesCard/FluxSourcesTable';
import { Source } from '../helpers';

const HelmRepositoriesPanel = ({ many }: { many?: boolean }) => {
  const { entity } = useEntity();
  const { data, loading, errors } = useHelmRepositories(entity);

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
    <InfoCard title="Helm Repositories">
      <FluxSourcesTable
        sources={data || []}
        isLoading={loading && !data}
        columns={helmDefaultColumns as TableColumn<Source>[]}
        many={many}
      />
    </InfoCard>
  );
};

/**
 * Render the HelmRepositories associated with the current Entity.
 *
 * @public
 */
export const EntityFluxHelmRepositoriesCard = ({
  many = true,
}: {
  many?: boolean;
}) => (
  <WeaveGitOpsContext>
    <HelmRepositoriesPanel many={many} />
  </WeaveGitOpsContext>
);
