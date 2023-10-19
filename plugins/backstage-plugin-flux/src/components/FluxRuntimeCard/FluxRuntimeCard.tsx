import React, { FC, useEffect, useState } from 'react';
import { InfoCard } from '@backstage/core-components';
import { WeaveGitOpsContext } from '../WeaveGitOpsContext';
import { FluxRuntimeTable, defaultColumns } from './FluxRuntimeTable';
import { getAllDeployments } from '../../hooks/useGetDeployments';
import { FluxController } from '../../objects';

const FluxRuntimePanel: FC<{ many?: boolean }> = ({ many }) => {
  const [deployments, setDeployments] = useState<FluxController[]>();

  useEffect(() => {
    getAllDeployments().then(data => {
      console.log(data);
    });
  }, [getAllDeployments]);

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
        deployments={deployments || []}
        isLoading={
          // loading &&
          !deployments
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
