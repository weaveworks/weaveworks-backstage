import React from 'react';
import { TableColumn } from '@backstage/core-components';
import {
  idColumn,
  nameAndClusterNameColumn,
  pathColumn,
  repoColumn,
  statusColumn,
  updatedColumn,
  syncColumn,
} from '../helpers';
import { HelmRelease, Kustomization } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';
import { T } from '../../hooks/query';

export const defaultColumns: TableColumn<Kustomization>[] = [
  idColumn(),
  nameAndClusterNameColumn(),
  pathColumn(),
  repoColumn(),
  statusColumn(),
  updatedColumn(),
  syncColumn(),
];

type Props = {
  deployments: T[];
  isLoading: boolean;
  columns: TableColumn<Kustomization>[];
};

export const FluxDeploymentsTable = ({
  deployments,
  isLoading,
  columns,
}: Props) => {
  console.log(deployments);
  // const data = kustomizations.map(k => {
  //   const {
  //     clusterName,
  //     namespace,
  //     name,
  //     sourceRef,
  //     path,
  //     conditions,
  //     suspended,
  //     type,
  //   } = k;
  //   return {
  //     id: `${clusterName}/${namespace}/${name}`,
  //     conditions,
  //     suspended,
  //     name,
  //     namespace,
  //     clusterName,
  //     sourceRef,
  //     path,
  //     type,
  //   } as Kustomization & { id: string };
  // });

  return (
    <FluxEntityTable
      columns={columns}
      title="Deployments"
      // data={data}
      data={[]}
      isLoading={isLoading}
    />
  );
};
