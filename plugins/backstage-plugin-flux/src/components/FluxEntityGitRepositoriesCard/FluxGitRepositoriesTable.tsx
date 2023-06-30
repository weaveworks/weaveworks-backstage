import React, { useMemo } from 'react';
import { Typography } from '@material-ui/core';
import { Table, TableColumn } from '@backstage/core-components';
import { useStyles } from '../utils';
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
import { GitRepository } from '../../objects';
import { isEqual } from 'lodash';

export const defaultColumns: TableColumn<GitRepository>[] = [
  idColumn(),
  nameAndClusterNameColumn(),
  verifiedColumn(),
  urlColumn(),
  tagColumn('Ref'),
  statusColumn(),
  updatedColumn(),
  syncColumn(),
];

type Props = {
  gitRepositories: GitRepository[];
  isLoading: boolean;
  columns: TableColumn<GitRepository>[];
};

export function useDeepCompareMemoize(value: React.DependencyList) {
  const ref = React.useRef<React.DependencyList>([]);
  // isEqual does a deep equal
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}

export const FluxGitRepositoriesTable = ({
  gitRepositories,
  isLoading,
  columns,
}: Props) => {
  const classes = useStyles();

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
    } as GitRepository & { id: string };
  });

  return useMemo(() => {
    return (
      <Table
        columns={columns}
        options={{ padding: 'dense', paging: true, search: true, pageSize: 5 }}
        title="Git Repositories"
        data={data}
        isLoading={isLoading}
        emptyContent={
          <div className={classes.empty}>
            <Typography variant="body1">
              No Git Repositories found for this entity.
            </Typography>
          </div>
        }
      />
    );
  }, useDeepCompareMemoize([data, isLoading, classes.empty, columns]));
};
