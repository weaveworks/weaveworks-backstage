import React from 'react';
import { TableColumn, TableFilter } from '@backstage/core-components';
import {
  idColumn,
  nameAndClusterNameColumn,
  urlColumn,
  statusColumn,
  updatedColumn,
  syncColumn,
  Source,
  artifactColumn,
  typeColumn,
  verifiedColumn,
  clusterNameFilteringColumn,
} from '../helpers';
import { GitRepository, HelmRepository, OCIRepository } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const sourceDefaultColumns: TableColumn<Source>[] = [
  clusterNameFilteringColumn(),
  idColumn(),
  typeColumn(),
  nameAndClusterNameColumn(),
  urlColumn(),
  artifactColumn(),
  statusColumn(),
  updatedColumn(),
  syncColumn(),
];
export const defaultColumns: TableColumn<GitRepository | OCIRepository>[] = [
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
export const helmDefaultColumns: TableColumn<Source>[] = [
  idColumn(),
  typeColumn(),
  nameAndClusterNameColumn(),
  {
    title: 'Provider',
    field: 'provider',
  },
  urlColumn(),
  artifactColumn(),
  statusColumn(),
  updatedColumn(),
  syncColumn(),
];

type Props = {
  Sources: Source[];
  isLoading: boolean;
  columns: TableColumn<Source>[];
  title: string;
};

const filters: TableFilter[] = [
  {
    column: 'Kind',
    type: 'multiple-select',
  },
  {
    column: 'Cluster name',
    type: 'multiple-select',
  },
];

export const FluxSourcesTable = ({
  Sources,
  isLoading,
  columns,
  title,
}: Props) => {
  let provider = '';
  let isVerifiable = false;

  const data = Sources.map(repo => {
    const {
      clusterName,
      namespace,
      name,
      conditions,
      suspended,
      url,
      type,
      artifact,
    } = repo;
    const cols = {
      id: `${clusterName}/${namespace}/${name}`,
      conditions,
      suspended,
      name,
      namespace,
      url,
      clusterName,
      type,
      artifact,
    };
    if (repo instanceof HelmRepository) {
      provider = repo.provider;
      return {
        ...cols,
        provider,
      } as HelmRepository & { id: string };
    }
    isVerifiable = repo.isVerifiable;
    return {
      ...cols,
      isVerifiable,
    } as Source & { id: string };
  });

  return (
    <FluxEntityTable
      columns={columns}
      title={title}
      data={
        data as (
          | (OCIRepository & { id: string })
          | (HelmRepository & { id: string })
          | (GitRepository & { id: string })
        )[]
      }
      isLoading={isLoading}
      filters={filters}
    />
  );
};
