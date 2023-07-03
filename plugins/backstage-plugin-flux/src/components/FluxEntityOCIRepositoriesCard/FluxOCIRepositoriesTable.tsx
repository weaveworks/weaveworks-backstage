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
} from '../helpers';
import { OCIRepository } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<OCIRepository>[] = [
  idColumn(),
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
};

export const FluxOCIRepositoriesTable = ({
  ociRepositories,
  isLoading,
  columns,
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
      title="OCI Repositories"
      data={data}
      isLoading={isLoading}
    />
  );
};
