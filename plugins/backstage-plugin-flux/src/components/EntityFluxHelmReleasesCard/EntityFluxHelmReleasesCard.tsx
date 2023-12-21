import React, { useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard } from '@backstage/core-components';
import { useHelmReleases } from '../../hooks/query';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import {
  FluxDeploymentsTable,
  defaultColumns,
} from '../EntityFluxDeploymentsCard/FluxDeploymentsTable';
import { useToggleSuspendResource } from '../../hooks/useToggleSuspendResource';
import { Deployment, Source } from '../helpers';
import SuspendMessageModal from '../SuspendMessageModal';

const HelmReleasePanel = ({ many }: { many?: boolean }) => {
  const { entity } = useEntity();
  const { data, loading, errors } = useHelmReleases(entity);
  const [selectedRow, setSelectedRow] = useState('');
  const [suspendMessage, setSuspendMessage] = useState('');
  const [suspendMessageModalOpen, setSuspendMessageModalOpen] = useState(false);

  const resource = data?.find(
    d => `${d.obj.metadata.namespace}/${d.obj.metadata.name}` === selectedRow,
  );

  console.log(resource);

  const { toggleSuspend } = useToggleSuspendResource(
    resource as Source | Deployment,
    true,
    suspendMessage,
  );

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
        setSelectedRow={setSelectedRow}
        setSuspendMessageModalOpen={setSuspendMessageModalOpen}
      />
      <SuspendMessageModal
        open={suspendMessageModalOpen}
        onCloseModal={setSuspendMessageModalOpen}
        suspend={toggleSuspend}
        setSuspendMessage={setSuspendMessage}
        suspendMessage={suspendMessage}
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
