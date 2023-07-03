import React from 'react';
import { TableColumn } from '@backstage/core-components';
import {
  idColumn,
  nameAndClusterNameColumn,
  verifiedColumn,
  urlColumn,
  tagColumn,
  statusColumn,
  updatedColumn,
  syncColumn,
} from '../helpers';
import { Kustomization } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<Kustomization>[] = [
  idColumn(),
  // nameAndClusterNameColumn(),
  // verifiedColumn(),
  // urlColumn(),
  // tagColumn('Tag'),
  statusColumn(),
  updatedColumn(),
  // syncColumn(),
];

type Props = {
  kustomizations: Kustomization[];
  isLoading: boolean;
  columns: TableColumn<Kustomization>[];
};

export const FluxKustomizationsTable = ({
  kustomizations,
  isLoading,
  columns,
}: Props) => {
  // TODO: Simplify this to store the ID and OCIRepository
  const data = kustomizations.map(k => {
    const {
      clusterName,
      namespace,
      name,
      // conditions,
      // suspended,
      // url,
      // type,
      // artifact,
      // isVerifiable,
    } = k;
    return {
      // make material-table happy and add an id to each row
      // FIXME: maybe we can tell material-table to use a custome key?
      id: `${clusterName}/${namespace}/${name}`,
      // conditions,
      // suspended,
      // name,
      // namespace,
      // url,
      // clusterName,
      // type,
      // artifact,
      // isVerifiable,
    } as Kustomization & { id: string };
  });

  return (
    <FluxEntityTable
      columns={columns}
      title="Kustomizations"
      data={data}
      isLoading={isLoading}
    />
  );
};
