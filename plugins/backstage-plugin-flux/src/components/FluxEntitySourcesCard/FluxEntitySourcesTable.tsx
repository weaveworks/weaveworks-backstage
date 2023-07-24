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
} from '../helpers';
import { GitRepository, HelmRepository, OCIRepository } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<Source>[] = [
  idColumn(),
  typeColumn(),
  nameAndClusterNameColumn(),
  urlColumn(),
  {
    title: 'Provider',
    field: 'provider',
  },
  artifactColumn(),
  verifiedColumn(),
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
    let columns = {
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
        ...columns,
        provider,
      } as HelmRepository & { id: string };
    } else {
      isVerifiable = repo.isVerifiable;
      return {
        ...columns,
        isVerifiable,
      } as Source & { id: string };
    }
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
