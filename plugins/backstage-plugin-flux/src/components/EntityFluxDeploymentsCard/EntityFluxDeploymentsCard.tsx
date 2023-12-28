import React, { useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard } from '@backstage/core-components';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { useFluxDeployments } from '../../hooks';
import { FluxDeploymentsTable, defaultColumns } from './FluxDeploymentsTable';
import SuspendMessageModal from '../SuspendMessageModal';

const DeploymentsPanel = ({ many }: { many?: boolean }) => {
  const { entity } = useEntity();
  const { data, loading, errors } = useFluxDeployments(entity);
  const [selectedRow, setSelectedRow] = useState<string>('');

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
    <InfoCard title="Deployments">
      <FluxDeploymentsTable
        deployments={data || []}
        isLoading={loading && !data}
        columns={defaultColumns}
        many={many}
        setSelectedRow={setSelectedRow}
      />
      <SuspendMessageModal
        data={data}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />
    </InfoCard>
  );
};

/**
 * Render the Deployments associated with the current Entity.
 *
 * @public
 */
export const EntityFluxDeploymentsCard = ({
  many = true,
}: {
  many?: boolean;
}) => (
  <WeaveGitOpsContext>
    <DeploymentsPanel many={many} />
  </WeaveGitOpsContext>
);
