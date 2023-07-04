import React from 'react';
import { TableColumn } from '@backstage/core-components';
import {
  idColumn,
  nameAndClusterNameColumn,
  repoColumn,
  statusColumn,
  updatedColumn,
  syncColumn,
} from '../helpers';
import { Kustomization } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<Kustomization>[] = [
  idColumn(),
  nameAndClusterNameColumn(),
  repoColumn(),
  statusColumn(),
  updatedColumn(),
  syncColumn(),
];

type Props = {
  kustomizations: Kustomization[];
  isLoading: boolean;
  columns: TableColumn<Kustomization>[];
};

export const FluxKustomizationsTable = ({
  kustomizations,
  isLoading,
  columns,
}: Props) => {
  const data = kustomizations.map(k => {
    const {
      clusterName,
      namespace,
      name,
      sourceRef,
      path,
      conditions,
      suspended,
      type,
    } = k;
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
  });

  return (
    <FluxEntityTable
      columns={columns}
      title="Kustomizations"
      data={data}
      isLoading={isLoading}
    />
  );
};
