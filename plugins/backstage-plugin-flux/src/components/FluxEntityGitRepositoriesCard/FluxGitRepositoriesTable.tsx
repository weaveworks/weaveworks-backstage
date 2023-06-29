import React, { useMemo } from 'react';
import { Typography } from '@material-ui/core';
import { Table, TableColumn } from '@backstage/core-components';
import { useStyles } from '../utils';
import {
  Id,
  NameAndClusterNameColumn,
  VerifiedColumn,
  UrlColumn,
  TagColumn,
  StatusColumn,
  UpdatedColumn,
} from '../helpers';
import { GitRepository } from '../../objects';

export const defaultColumns: TableColumn<GitRepository>[] = [
  Id(),
  NameAndClusterNameColumn(),
  VerifiedColumn(),
  UrlColumn(),
  TagColumn(),
  StatusColumn(),
  UpdatedColumn(),
];

type Props = {
  gitRepositories: GitRepository[];
  isLoading: boolean;
  columns: TableColumn<GitRepository>[];
};

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
        options={{ padding: 'dense', paging: true, search: false, pageSize: 5 }}
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
  }, [data, isLoading, columns, classes.empty]);
};
