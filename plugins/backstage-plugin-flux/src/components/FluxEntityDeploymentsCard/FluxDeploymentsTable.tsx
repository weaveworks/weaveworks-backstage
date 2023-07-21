import React from 'react';
import { TableColumn, TableFilter } from '@backstage/core-components';
import {
  clusterNameFilteringColumn,
  idColumn,
  nameAndClusterNameColumn,
  statusColumn,
  updatedColumn,
  syncColumn,
  Deployment,
  repoColumn,
  sourceColumn,
  typeColumn,
} from '../helpers';
import { HelmChart, HelmRelease, Kustomization } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<Deployment>[] = [
  clusterNameFilteringColumn(),
  idColumn(),
  typeColumn(),
  nameAndClusterNameColumn(),
  repoColumn(),
  sourceColumn(),
  statusColumn(),
  updatedColumn(),
  syncColumn(),
];

const filters: TableFilter[] = [
  {
    column: 'Cluster name',
    type: 'multiple-select',
  },
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
  let helmChart = {} as HelmChart;
  let path = '';

  const data = deployments.map(d => {
    const {
      clusterName,
      namespace,
      name,
      conditions,
      suspended,
      sourceRef,
      type,
      lastAppliedRevision,
    } = d;
    if (d instanceof Kustomization) {
      path = d.path;
      return {
        id: `${clusterName}/${namespace}/${name}`,
        conditions,
        suspended,
        name,
        namespace,
        lastAppliedRevision,
        clusterName,
        sourceRef,
        type,
        path,
      } as Kustomization & { id: string };
    } else if (d instanceof HelmRelease) {
      helmChart = d.helmChart;
      return {
        id: `${clusterName}/${namespace}/${name}`,
        conditions,
        suspended,
        name,
        namespace,
        lastAppliedRevision,
        clusterName,
        sourceRef,
        type,
        helmChart,
      } as HelmRelease & { id: string };
    }
    return null;
  });

  return (
    <FluxEntityTable
      columns={columns}
      data={
        data as (
          | (HelmRelease & { id: string })
          | (Kustomization & { id: string })
        )[]
      }
      isLoading={isLoading}
      filters={filters}
    />
  );
};
