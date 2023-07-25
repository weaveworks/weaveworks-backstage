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
import { OCIRepository } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<OCIRepository>[] = [
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
  ociRepositories: OCIRepository[];
  isLoading: boolean;
  columns: TableColumn<OCIRepository>[];
  many?: boolean;
};

export const FluxOCIRepositoriesTable = ({
  ociRepositories,
  isLoading,
  columns,
  many,
}: Props) => {
  // TODO: Simplify this to store the ID and OCIRepository
  const data = ociRepositories.map(or => {
    const {
      clusterName,
      namespace,
      name,
      conditions,
      suspended,
      url,
      type,
      artifact,
      isVerifiable,
    } = or;
    return {
      // make material-table happy and add an id to each row
      // FIXME: maybe we can tell material-table to use a custome key?
      id: `${clusterName}/${namespace}/${name}`,
      conditions,
      suspended,
      name,
      namespace,
      url,
      clusterName,
      type,
      artifact,
      isVerifiable,
    } as OCIRepository & { id: string };
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
