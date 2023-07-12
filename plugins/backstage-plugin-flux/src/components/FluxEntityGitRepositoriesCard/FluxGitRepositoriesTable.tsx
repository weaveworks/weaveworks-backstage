import React from 'react';
import { TableColumn } from '@backstage/core-components';
import {
  idColumn,
  nameAndClusterNameColumn,
  verifiedColumn,
  urlColumn,
  artifactColumn,
  statusColumn,
  updatedColumn,
  syncColumn,
  typeColumn,
} from '../helpers';
import { GitRepository } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<GitRepository>[] = [
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
};

export const FluxGitRepositoriesTable = ({
  gitRepositories,
  isLoading,
  columns,
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
      title="Git Repositories"
      data={data}
      isLoading={isLoading}
    />
  );
};
