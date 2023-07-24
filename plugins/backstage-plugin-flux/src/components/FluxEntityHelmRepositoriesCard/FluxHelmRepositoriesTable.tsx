import React from 'react';
import { TableColumn } from '@backstage/core-components';
import {
  idColumn,
  typeColumn,
  nameAndClusterNameColumn,
  urlColumn,
  statusColumn,
  updatedColumn,
  syncColumn,
  artifactColumn,
} from '../helpers';
import { HelmRepository } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<HelmRepository>[] = [
  idColumn(),
  typeColumn(),
  nameAndClusterNameColumn(),
  urlColumn(),
  {
    title: 'Provider',
    field: 'provider',
  },
  artifactColumn(),
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
      title="Helm Repositories"
      data={data}
      isLoading={isLoading}
    />
  );
};
