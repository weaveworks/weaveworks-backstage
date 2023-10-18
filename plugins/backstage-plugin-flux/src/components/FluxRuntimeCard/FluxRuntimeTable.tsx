import React from 'react';
import { TableColumn } from '@backstage/core-components';
import {
  clusterNameFilteringColumn,
  idColumn,
  nameAndClusterNameColumn,
  filters,
} from '../helpers';
import { FluxEntityTable } from '../FluxEntityTable';
import { FluxController } from '../../objects';

export const defaultColumns: TableColumn<FluxController>[] = [
  clusterNameFilteringColumn(),
  idColumn(),
  nameAndClusterNameColumn(),
];

type Props = {
  deployments: FluxController[];
  isLoading: boolean;
  columns: TableColumn<FluxController>[];
  many?: boolean;
};

export const FluxRuntimeTable = ({
  deployments,
  isLoading,
  columns,
  many,
}: Props) => {
  const data = deployments.map(d => {
    const { clusterName, namespace, name, conditions, suspended } = d;
    return {
      id: `${clusterName}/${namespace}/${name}`,
      conditions,
      suspended,
      name,
      namespace,
      clusterName,
    } as FluxController & { id: string };
  });

  return (
    <FluxEntityTable
      columns={columns}
      data={data as FluxController[]}
      isLoading={isLoading}
      filters={filters}
      many={many}
    />
  );
};
