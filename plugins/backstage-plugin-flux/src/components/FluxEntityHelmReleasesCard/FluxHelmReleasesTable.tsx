import React, { useMemo } from 'react';
import { HelmRelease, KubeStatusIndicator } from '@weaveworks/weave-gitops';
import { Typography } from '@material-ui/core';
import { Table, TableColumn } from '@backstage/core-components';
import { DateTime } from 'luxon';
import { automationLastUpdated, useStyles } from '../utils';
import { NameAndClusterName } from '../helpers';

export const defaultColumns: TableColumn<HelmRelease>[] = [
  {
    title: 'id',
    field: 'id',
    hidden: true,
  },
  {
    title: 'Name',
    field: 'name',
    searchable: true,
    render: (hr: HelmRelease): React.ReactNode =>
      NameAndClusterName({ resource: hr }),
  },
  {
    title: 'Chart',
    field: 'helmChart.chart',
    render: (hr: HelmRelease) => {
      return `${hr.helmChart.chart}/${hr.lastAppliedRevision}`;
    },
  },
  {
    title: 'Status',
    render: (hr: HelmRelease) => {
      return (
        <KubeStatusIndicator
          short
          conditions={hr.conditions}
          suspended={hr.suspended}
        />
      );
    },
  },
  {
    title: 'Updated',
    render: (hr: HelmRelease) => {
      return DateTime.fromISO(automationLastUpdated(hr)).toRelative({
        locale: 'en',
      });
    },
  },
];

type Props = {
  helmReleases: HelmRelease[];
  isLoading: boolean;
  columns: TableColumn<HelmRelease>[];
};

/**
 * @public
 */
export const FluxHelmReleasesTable = ({
  helmReleases,
  isLoading,
  columns,
}: Props) => {
  const classes = useStyles();

  // TODO: Simplify this to store the ID and HelmRelease
  const data = helmReleases.map(hr => {
    return {
      id: `${hr.clusterName}/${hr.namespace}/${hr.name}`,
      conditions: hr.conditions,
      suspended: hr.suspended,
      name: hr.name,
      namespace: hr.namespace,
      helmChart: hr.helmChart,
      lastAppliedRevision: hr.lastAppliedRevision,
      clusterName: hr.clusterName,
      type: hr.type,
    } as HelmRelease & { id: string };
  });

  return useMemo(() => {
    return (
      <Table
        columns={columns}
        options={{ paging: true, search: true, pageSize: 5 }}
        title="Helm Releases"
        data={data}
        isLoading={isLoading}
        emptyContent={
          <div className={classes.empty}>
            <Typography variant="body1">
              No Helm Releases found for this entity.
            </Typography>
          </div>
        }
      />
    );
  }, [data, isLoading, columns, classes.empty]);
};
