import React from 'react';
import { TableColumn } from '@backstage/core-components';
import {
  idColumn,
  nameAndClusterNameColumn,
  statusColumn,
  updatedColumn,
  syncColumn,
  Deployment,
} from '../helpers';
import { HelmRelease, Kustomization } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<Deployment>[] = [
  idColumn(),
  nameAndClusterNameColumn(),
  statusColumn(),
  updatedColumn(),
  syncColumn(),
];

type Props = {
  deployments: Deployment[];
  isLoading: boolean;
  columns: TableColumn<Deployment>[];
};

export const FluxDeploymentsTable = ({
  deployments,
  isLoading,
  columns,
}: Props) => {
  console.log(deployments);

  const data = deployments.map(d => {
    // TODO: Simplify the the below, extract common fields and add custom
    if (d instanceof Kustomization) {
      const {
        clusterName,
        namespace,
        name,
        sourceRef,
        path,
        conditions,
        suspended,
        type,
      } = d;
      return {
        id: `${clusterName}/${namespace}/${name}`,
        conditions,
        suspended,
        name,
        namespace,
        clusterName,
        sourceRef,
        path,
        type,
      } as Kustomization & { id: string };
    } else if (d instanceof HelmRelease) {
      const {
        clusterName,
        namespace,
        name,
        helmChart,
        conditions,
        suspended,
        sourceRef,
        type,
        lastAppliedRevision,
      } = d;
      return {
        id: `${clusterName}/${namespace}/${name}`,
        conditions,
        suspended,
        name,
        namespace,
        helmChart,
        lastAppliedRevision,
        clusterName,
        sourceRef,
        type,
      } as HelmRelease & { id: string };
    }
  });

  return (
    <FluxEntityTable
      columns={columns}
      title="Deployments"
      data={data}
      isLoading={isLoading}
    />
  );
};
