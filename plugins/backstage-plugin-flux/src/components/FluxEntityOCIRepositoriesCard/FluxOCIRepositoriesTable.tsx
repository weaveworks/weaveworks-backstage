import React, { useMemo } from 'react';
import { Typography } from '@material-ui/core';
import { Table, TableColumn } from '@backstage/core-components';
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
import { useStyles } from '../utils';
import { OCIRepository } from '../../objects';

export const defaultColumns: TableColumn<OCIRepository>[] = [
  idColumn(),
  nameAndClusterNameColumn(),
  verifiedColumn(),
  urlColumn(),
  tagColumn(),
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
  const classes = useStyles();

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
    } as OCIRepository & { id: string };
  });

  return useMemo(() => {
    return (
      <Table
        columns={columns}
        options={{ padding: 'dense', paging: true, search: true, pageSize: 5 }}
        title="OCI Repositories"
        data={data}
        isLoading={isLoading}
        emptyContent={
          <div className={classes.empty}>
            <Typography variant="body1">
              No OCI Repositories found for this entity.
            </Typography>
          </div>
        }
      />
    );
  }, [data, isLoading, columns, classes.empty]);
};
