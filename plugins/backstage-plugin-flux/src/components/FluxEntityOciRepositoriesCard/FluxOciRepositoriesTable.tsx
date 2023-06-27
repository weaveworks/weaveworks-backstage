import React, { useMemo } from 'react';
import styled from 'styled-components';
import { KubeStatusIndicator } from '@weaveworks/weave-gitops';
import { Typography } from '@material-ui/core';
import { Table, TableColumn } from '@backstage/core-components';
import { DateTime } from 'luxon';
import { NameLabel, verifiedStatus } from '../helpers';
import { OCIRepository } from '../../hooks';
import {
  automationLastUpdated,
  useStyles,
} from '../utils';

const UrlWrapper = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  direction: rtl;
  max-width: 350px;
`;

export const defaultColumns: TableColumn<OCIRepository>[] = [
  {
    title: 'id',
    field: 'id',
    hidden: true,
  },
  {
    title: 'Name',
    render: (repo: OCIRepository) => <NameLabel resource={repo} />,
    field: 'name',
    searchable: true,
  },
  {
    title: 'Cluster',
    field: 'clusterName',
    searchable: true,
  },
  {
    title: 'Verified',
    render: (repo: OCIRepository) => {
      return verifiedStatus({ resource: repo });
    },
  },
  {
    title: 'URL',
    render: (repo: OCIRepository) => {
      return <UrlWrapper title={repo.url}>{repo.url}</UrlWrapper>;
    },
    field: 'url',
    searchable: true,
  },
  {
    title: 'Revision',
    render: (repo: OCIRepository) => {
      return <span>{repo.artifact?.revision.split('@')[0]}</span>;
    },
    field: 'revision',
    searchable: true,
  },
  {
    title: 'Status',
    render: (repo: OCIRepository) => {
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
    render: (repo: OCIRepository) => {
      return DateTime.fromISO(repo.lastUpdatedAt).toRelative({
        locale: 'en',
      });
    },
  },
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
      artifact: or.artifact,
      revision: or.artifact?.revision,
      // can this use lastUpdate: or.lastUpdatedAt ?
      lastUpdatedAt: automationLastUpdated(or),
    } as OCIRepository & { id: string; lastUpdatedAt: string };
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
