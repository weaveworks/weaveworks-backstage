import React from 'react';
import { TableColumn } from '@backstage/core-components';
import {
  clusterNameFilteringColumn,
  idColumn,
  nameAndClusterNameColumn,
  statusColumn,
  updatedColumn,
  syncColumn,
  typeColumn,
  filters,
  imageRepository,
  policy,
} from '../helpers';
import { ImagePolicy } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<ImagePolicy>[] = [
  clusterNameFilteringColumn(),
  idColumn(),
  typeColumn(),
  nameAndClusterNameColumn(),
  statusColumn(),
  policy(),
  imageRepository(),
  updatedColumn(),
  syncColumn(),
];

type Props = {
  imagePolicies: ImagePolicy[];
  isLoading: boolean;
  columns: TableColumn<ImagePolicy>[];
  many?: boolean;
};

export const FluxImagePoliciesTable = ({
  imagePolicies,
  isLoading,
  columns,
  many,
}: Props) => {
  const data = imagePolicies.map(d => {
    const {
      clusterName,
      namespace,
      name,
      conditions,
      suspended,
      sourceRef,
      type,
      imagePolicy,
      imageRepositoryRef,
    } = d;
    return {
      id: `${clusterName}/${namespace}/${name}`,
      conditions,
      suspended,
      name,
      namespace,
      clusterName,
      sourceRef,
      type,
      imagePolicy,
      imageRepositoryRef,
    } as ImagePolicy & { id: string };
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
