import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard, TableColumn } from '@backstage/core-components';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { useOCIRepositories } from '../../hooks';
import {
  gitOciDefaultColumns,
  FluxSourcesTable,
} from '../EntityFluxSourcesCard/FluxSourcesTable';
import { Source } from '../helpers';

const OCIRepositoryPanel = ({ many }: { many?: boolean }) => {
  const { entity } = useEntity();
  const { data, loading, errors } = useOCIRepositories(entity);

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
    <InfoCard title="OCI Repositories">
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
 * Render the OCIRepositories associated with the current Entity.
 *
 * @public
 */
export const EntityFluxOCIRepositoriesCard = ({
  many = true,
}: {
  many?: boolean;
}) => (
  <WeaveGitOpsContext>
    <OCIRepositoryPanel many={many} />
  </WeaveGitOpsContext>
);
