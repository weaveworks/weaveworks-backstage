import React from 'react';
import { Flex, KubeStatusIndicator } from '@weaveworks/weave-gitops';
import { Typography } from '@material-ui/core';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { Table, TableColumn } from '@backstage/core-components';
import { automationLastUpdated, useStyles } from '../utils';
import { DateTime } from 'luxon';
import { NameLabel } from '../helpers';
import { OciRepository } from '../../hooks';

const wantVerified = (repo: OciRepository): boolean => repo.verification !== '';

export const urlWithVerified = ({
  repo,
}: {
  repo: OciRepository;
}): JSX.Element => {
  if (!wantVerified(repo)) {
    return <span>{repo.url}</span>;
  }

  return (
    <Flex>
      <VerifiedUserIcon style={{ marginRight: '12px', color: '#009CCC' }} />
      {repo.url}
    </Flex>
  );
};

export const defaultColumns: TableColumn<OciRepository>[] = [
  {
    title: 'Name',
    render: (repo: OciRepository) => <NameLabel resource={repo} />,
  },
  {
    title: 'URL',
    render: (repo: OciRepository) => {
      return urlWithVerified({ repo });
    },
  },
  {
    title: 'Cluster',
    render: (repo: OciRepository) => {
      return repo.clusterName;
    },
  },
  {
    title: 'Status',
    render: (repo: OciRepository) => {
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
    render: (repo: OciRepository) => {
      return DateTime.fromISO(automationLastUpdated(repo)).toRelative({
        locale: 'en',
      });
    },
  },
];

type Props = {
  ociRepositories: OciRepository[];
  isLoading: boolean;
  columns: TableColumn<OciRepository>[];
};

export const FluxOciRepositoriesTable = ({
  ociRepositories,
  isLoading,
  columns,
}: Props) => {
  const classes = useStyles();

  // TODO: Simplify this to store the ID and OciRepository
  const data = ociRepositories.map(or => {
    return {
      // make material-table happy and add an id to each row
      // FIXME: maybe we can tell material-table to use a custome key?
      id: `${or.clusterName}/${or.namespace}/${or.name}`,
      conditions: or.conditions,
      suspended: or.suspended,
      name: or.name,
      namespace: or.namespace,
      url: or.url,
      clusterName: or.clusterName,
      type: or.type,
    } as OciRepository & { id: string };
  });

  return (
    <Table
      columns={columns}
      options={{ padding: 'dense', paging: true, search: false, pageSize: 5 }}
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
};
