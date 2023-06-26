import React from 'react';
import { HelmRelease, KubeStatusIndicator } from '@weaveworks/weave-gitops';
import { Condition } from '@weaveworks/weave-gitops/ui/lib/api/core/types.pb';
import { Typography, makeStyles } from '@material-ui/core';
import { Link, Table, TableColumn } from '@backstage/core-components';
import { automationLastUpdated } from './utils';
import { DateTime } from 'luxon';
import { useWeaveFluxDeepLink } from '../../hooks';

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

const NameLabel = ({ helmRelease }: { helmRelease: HelmRelease }) => {
  const { name, namespace } = helmRelease;
  const deepLink = useWeaveFluxDeepLink(helmRelease);
  const label = `${namespace}/${name}`;
  if (!deepLink) {
    return <span>{label}</span>;
  }

  return <Link to={deepLink}>{label}</Link>;
};

export const defaultColumns: TableColumn<HelmReleaseRowData>[] = [
  {
    title: 'Name',
    field: 'name',
    render: (hr: HelmReleaseRowData) => (
      <NameLabel helmRelease={hr.helmRelease} />
    ),
  },
  {
    title: 'Chart',
    field: 'chart',
  },
  {
    title: 'Cluster',
    field: 'cluster',
  },
  {
    title: 'Status',
    render: (hr: HelmReleaseRowData) => {
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
    field: 'updated',
    render: (hr: HelmReleaseRowData) => {
      return DateTime.fromISO(hr.updated).toRelative({
        locale: 'en',
      });
    },
  },
];

type HelmReleaseRowData = {
  id: string;
  name: string;
  chart: string;
  cluster: string;
  conditions: Condition[];
  suspended: boolean;
  updated: string;
  helmRelease: HelmRelease;
};

type Props = {
  helmReleases: HelmRelease[];
  isLoading: boolean;
  columns: TableColumn<HelmReleaseRowData>[];
};

export const FluxHelmReleasesTable = ({
  helmReleases,
  isLoading,
  columns,
}: Props) => {
  const classes = useStyles();

  const data = helmReleases.map(hr => {
    return {
      // make material-table happy and add an id to each row
      // FIXME: maybe we can tell material-table to use a custome key?
      id: `${hr.clusterName}/${hr.namespace}/${hr.name}`,
      chart: `${hr.helmChart.chart}/${hr.lastAppliedRevision}`,
      conditions: hr.conditions,
      suspended: hr.suspended,
      name: `${hr.namespace}/${hr.name}`,
      updated: automationLastUpdated(hr),
      cluster: hr.clusterName,
      helmRelease: {
        name: hr.name,
        namespace: hr.namespace,
        clusterName: hr.clusterName,
      },
    } as HelmReleaseRowData;
  });

  return (
    <Table<HelmReleaseRowData>
      columns={columns}
      options={{ padding: 'dense', paging: true, search: false, pageSize: 5 }}
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
};
