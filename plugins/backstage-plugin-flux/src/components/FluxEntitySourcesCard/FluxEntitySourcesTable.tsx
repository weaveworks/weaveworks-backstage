import React from 'react';
import { TableColumn } from '@backstage/core-components';
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
  filters,
} from '../helpers';
import { GitRepository, HelmRepository, OCIRepository } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

const commonInitialColumns: TableColumn<
  GitRepository | OCIRepository | HelmRepository
>[] = [
  clusterNameFilteringColumn(),
  idColumn(),
  typeColumn(),
  nameAndClusterNameColumn(),
];

const commonEndColumns: TableColumn<Source>[] = [
  urlColumn(),
  artifactColumn(),
  statusColumn(),
  updatedColumn(),
  syncColumn(),
];

export const sourceDefaultColumns: TableColumn<Source>[] = [
  ...commonInitialColumns,
  ...commonEndColumns,
];

export const gitOciDefaultColumns = [
  ...commonInitialColumns,
  verifiedColumn(),
  ...commonEndColumns,
] as TableColumn<GitRepository | OCIRepository>[];

export const helmDefaultColumns = [
  ...commonInitialColumns,
  { title: 'Provider', field: 'provider' },
  ...commonEndColumns,
] as TableColumn<HelmRepository>[];

type Props = {
  sources: Source[];
  isLoading: boolean;
  columns: TableColumn<Source>[];
};

export const FluxSourcesTable = ({ sources, isLoading, columns }: Props) => {
  let provider = '';
  let isVerifiable = false;

  const data = sources.map(repo => {
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
