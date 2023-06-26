import React, { useMemo } from 'react';
import { Flex, KubeStatusIndicator } from '@weaveworks/weave-gitops';
import { Tooltip, Typography } from '@material-ui/core';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { Table, TableColumn } from '@backstage/core-components';
import { DateTime } from 'luxon';
import { NameLabel } from '../helpers';
import { OciRepository } from '../../hooks';
import {
  automationLastUpdated,
  findVerificationCondition,
  useStyles,
} from '../utils';

const wantVerified = (repo: OciRepository): boolean =>
  repo.verification !== undefined;

export const urlWithVerified = ({
  repo,
}: {
  repo: OciRepository;
}): JSX.Element => {
  if (!wantVerified(repo)) {
    return <span>{repo.url}</span>;
  }

  const condition = findVerificationCondition(repo);

  let color = '#BC3B1D';
  if (condition?.status === 'True') {
    color = '#27AE60';
  }

  // TODO: shift the style to a "good" or "bad" case?
  // TODO: Alternative icon?

  return (
    <Flex start align>
      <Tooltip title={condition?.message || ''}>
        <VerifiedUserIcon
          style={{ marginRight: '12px', color, height: '16px' }}
        />
      </Tooltip>
      {repo.url}
    </Flex>
  );
};

export const defaultColumns: TableColumn<OciRepository>[] = [
  {
    title: 'id',
    field: 'id',
    hidden: true,
  },
  {
    title: 'Name',
    render: (repo: OciRepository) => <NameLabel resource={repo} />,
    field: 'name',
    searchable: true,
  },
  {
    title: 'Cluster',
    field: 'clusterName',
    searchable: true,
  },
  {
    title: 'URL',
    render: (repo: OciRepository) => {
      return urlWithVerified({ repo });
    },
    field: 'url',
    searchable: true,
  },
  {
    title: 'Revision',
    field: 'artifact.revision',
    searchable: true,
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
    field: 'lastUpdatedAt',
    render: (repo: OciRepository) => {
      return DateTime.fromISO(repo.lastUpdatedAt).toRelative({
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
      verification: or.verification,
      url: or.url,
      clusterName: or.clusterName,
      type: or.type,
      artifact: or.artifact,
      // can this use lastUpdate: or.lastUpdatedAt ?
      lastUpdatedAt: automationLastUpdated(or),
    } as OciRepository & { id: string; lastUpdatedAt: string };
  });

  return useMemo(() => {
    return (
      <Table
        columns={columns}
        options={{ paging: true, search: true, pageSize: 5 }}
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
