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
} from '../helpers';
import { GitRepository, HelmRepository, OCIRepository } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<
  HelmRepository | GitRepository | OCIRepository
>[] = [
  idColumn(),
  typeColumn(),
  nameAndClusterNameColumn(),
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
};

export const FluxSourcesTable = ({ Sources, isLoading, columns }: Props) => {
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

    return {
      id: `${clusterName}/${namespace}/${name}`,
      conditions,
      suspended,
      name,
      namespace,
      url,
      clusterName,
      type,
      artifact,
    } as Source & { id: string };
  });

  return (
    <FluxEntityTable
      columns={columns}
      title="Sources"
      data={
        data as (
          | (OCIRepository & { id: string })
          | (HelmRepository & { id: string })
          | (GitRepository & { id: string })
        )[]
      }
      isLoading={isLoading}
    />
  );
};
