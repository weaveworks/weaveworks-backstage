import React from 'react';
import { TableColumn } from '@backstage/core-components';
import {
  clusterNameFilteringColumn,
  idColumn,
  nameAndClusterNameColumn,
  verifiedColumn,
  urlColumn,
  artifactColumn,
  statusColumn,
  updatedColumn,
  syncColumn,
  filters,
  typeColumn,
} from '../helpers';
import { GitRepository } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<GitRepository>[] = [
  clusterNameFilteringColumn(),
  idColumn(),
  typeColumn(),
  nameAndClusterNameColumn(),
  verifiedColumn(),
  urlColumn(),
  artifactColumn(),
  statusColumn(),
  updatedColumn(),
  syncColumn(),
];

type Props = {
  gitRepositories: GitRepository[];
  isLoading: boolean;
  columns: TableColumn<GitRepository>[];
  many?: boolean;
};

export const FluxGitRepositoriesTable = ({
  gitRepositories,
  isLoading,
  columns,
  many,
}: Props) => {
  const data = gitRepositories.map(repo => {
    const {
      clusterName,
      namespace,
      name,
      conditions,
      suspended,
      url,
      reference,
      type,
      artifact,
      isVerifiable,
    } = repo;
    return {
      id: `${clusterName}/${namespace}/${name}`,
      conditions,
      suspended,
      name,
      namespace,
      url,
      reference,
      clusterName,
      type,
      artifact,
      isVerifiable,
    } as GitRepository & { id: string };
  });

  return (
    <FluxEntityTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      filters={filters}
      many={many}
    />
  );
};
