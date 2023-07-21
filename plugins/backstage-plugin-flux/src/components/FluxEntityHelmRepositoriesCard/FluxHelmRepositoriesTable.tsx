import React from 'react';
import { TableColumn } from '@backstage/core-components';
import {
  clusterNameFilteringColumn,
  idColumn,
  typeColumn,
  nameAndClusterNameColumn,
  urlColumn,
  statusColumn,
  updatedColumn,
  syncColumn,
  filters,
} from '../helpers';
import { HelmRepository } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<HelmRepository>[] = [
  clusterNameFilteringColumn(),
  idColumn(),
  typeColumn(),
  nameAndClusterNameColumn(),
  urlColumn(),
  {
    title: 'Provider',
    field: 'provider',
  },
  {
    title: 'revision',
    field: 'artifact.revision',
  },
  statusColumn(),
  updatedColumn(),
  syncColumn(),
];

type Props = {
  helmRepositories: HelmRepository[];
  isLoading: boolean;
  columns: TableColumn<HelmRepository>[];
};

export const FluxHelmRepositoriesTable = ({
  helmRepositories,
  isLoading,
  columns,
}: Props) => {
  const data = helmRepositories.map(repo => {
    const {
      clusterName,
      namespace,
      name,
      conditions,
      suspended,
      url,
      type,
      provider,
      artifact,
    } = repo;
    return {
      id: `${clusterName}/${namespace}/${name}`,
      conditions,
      suspended,
      name,
      namespace,
      url,
      clusterName,
      type,
      provider,
      artifact,
    } as HelmRepository & { id: string };
  });

  return (
    <FluxEntityTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      filters={filters}
    />
  );
};
