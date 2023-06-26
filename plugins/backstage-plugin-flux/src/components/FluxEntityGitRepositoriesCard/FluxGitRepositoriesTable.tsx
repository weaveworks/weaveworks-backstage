import React from 'react';
import { KubeStatusIndicator } from '@weaveworks/weave-gitops';
import { Typography } from '@material-ui/core';
import { Table, TableColumn } from '@backstage/core-components';
import { automationLastUpdated, useStyles } from '../utils';
import { DateTime } from 'luxon';
import { NameLabel } from '../helpers';
import { GitRepository } from '../../hooks';

export const defaultColumns: TableColumn<GitRepository>[] = [
  {
    title: 'id',
    field: 'id', 
    hidden: true
  },
  {
    title: 'Name',
    render: (repo: GitRepository) => <NameLabel resource={repo} />,
  },
  {
    title: 'Cluster',
    field: 'clusterName',
  },
  {
    title: 'URL',
    field: 'url',
  },
  {
    title: 'Revision',
    // TODO This should pull from the status.artifact.revision
    field: 'artifact.revision',
  },
  {
    title: 'Status',
    render: (repo: GitRepository) => {
      return (
        <KubeStatusIndicator
          short
          conditions={repo.conditions}
          suspended={repo.suspended}
        />
      );
    },
  },
  {
    title: 'Updated',
    render: (repo: GitRepository) => {
      return DateTime.fromISO(automationLastUpdated(repo)).toRelative({
        locale: 'en',
      });
    },
  },
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
    return {
      id: `${repo.clusterName}/${repo.namespace}/${repo.name}`,
      conditions: repo.conditions,
      suspended: repo.suspended,
      name: repo.name,
      namespace: repo.namespace,
      url: repo.url,
      reference: repo.reference,
      clusterName: repo.clusterName,
      type: repo.type,
      artifact: repo.artifact,
    } as GitRepository & { id: string };
  });

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
};
