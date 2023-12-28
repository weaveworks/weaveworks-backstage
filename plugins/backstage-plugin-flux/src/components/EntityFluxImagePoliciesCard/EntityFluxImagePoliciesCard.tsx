import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard } from '@backstage/core-components';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { useImagePolicies } from '../../hooks';
import {
  FluxImagePoliciesTable,
  defaultColumns,
} from './FluxImagePoliciesTable';

const ImagePolicyPanel = ({ many }: { many?: boolean }) => {
  const { entity } = useEntity();
  const { data, loading, errors } = useImagePolicies(entity);

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
