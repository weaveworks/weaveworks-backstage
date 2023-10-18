import React from 'react';
import { InfoCard } from '@backstage/core-components';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { FluxRuntimeTable, defaultColumns } from './FluxRuntimeTable';
import {
  getAllDeployments,
  // useGetDeployments,
} from '../../hooks/useGetDeployments';

const FluxRuntimePanel = ({ many }: { many?: boolean }) => {
  let deployments = getAllDeployments();

  console.log(deployments);

  // if (error) {
  //   return (
  //     <div>
  //       Errors:
  //       <ul>
  //         {errors.map(err => (
  //           <li>{err.message}</li>
  //         ))}
  //       </ul>
  //     </div>
  //   );
  // }

  return (
    <InfoCard title="Flux runtime">
      <FluxRuntimeTable
        deployments={[]}
        isLoading={
          // loading &&
          false
        }
        columns={defaultColumns}
        many={many}
      />
    </InfoCard>
  );
};

/**
 * Render the Deployments in Flux Runtime.
 *
 * @public
 */
export const FluxRuntimeCard = ({ many = true }: { many?: boolean }) => (
  <WeaveGitOpsContext>
    <FluxRuntimePanel many={many} />
  </WeaveGitOpsContext>
);
