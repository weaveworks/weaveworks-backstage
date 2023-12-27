import React, { useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard } from '@backstage/core-components';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { useImagePolicies } from '../../hooks';
import {
  FluxImagePoliciesTable,
  defaultColumns,
} from './FluxImagePoliciesTable';
import SuspendMessageModal from '../SuspendMessageModal';

const ImagePolicyPanel = ({ many }: { many?: boolean }) => {
  const { entity } = useEntity();
  const { data, loading, errors } = useImagePolicies(entity);
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
    <InfoCard title="Image Policies">
      <FluxImagePoliciesTable
        imagePolicies={data || []}
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
 * Render the ImagePolicies associated with the current Entity.
 *
 * @public
 */
export const EntityFluxImagePoliciesCard = ({
  many = true,
}: {
  many?: boolean;
}) => (
  <WeaveGitOpsContext>
    <ImagePolicyPanel many={many} />
  </WeaveGitOpsContext>
);
