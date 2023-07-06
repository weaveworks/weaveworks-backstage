import React from 'react';
import { TableColumn } from '@backstage/core-components';
import {
  idColumn,
  nameAndClusterNameColumn,
  statusColumn,
  updatedColumn,
  syncColumn,
  Deployment,
  typeColumn,
  pathColumn,
  chartColumn,
  repoColumn,
} from '../helpers';
import { HelmChart, HelmRelease, Kustomization } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<Deployment>[] = [
  idColumn(),
  nameAndClusterNameColumn(),
  typeColumn(),
  pathColumn(),
  repoColumn(),
  chartColumn(),
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
  let helmChart = {} as HelmChart;
  let path = '';
  let repo = '';

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
  });

  return (
    <FluxEntityTable
      columns={columns}
      title="Deployments"
      data={
        data as
          | (HelmRelease & { id: string })[]
          | (Kustomization & { id: string })[]
      }
      isLoading={isLoading}
    />
  );
};
