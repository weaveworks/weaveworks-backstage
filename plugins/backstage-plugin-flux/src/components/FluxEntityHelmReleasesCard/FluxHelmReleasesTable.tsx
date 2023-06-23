import React from 'react';
import { HelmRelease, KubeStatusIndicator } from '@weaveworks/weave-gitops';
import { Typography, makeStyles } from '@material-ui/core';
import { Link, Table, TableColumn } from '@backstage/core-components';
import { automationLastUpdated } from '../utils';
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

export const defaultColumns: TableColumn<HelmRelease>[] = [
  {
    title: 'Name',
    render: (hr: HelmRelease) => <NameLabel helmRelease={hr} />,
  },
  {
    title: 'Chart',
    render: (hr: HelmRelease) => {
      return `${hr.helmChart.chart}/${hr.lastAppliedRevision}`;
    },
  },
  {
    title: 'Cluster',
    render: (hr: HelmRelease) => {
      return hr.clusterName;
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

export const FluxHelmReleasesTable = ({
  helmReleases,
  isLoading,
  columns,
}: Props) => {
  const classes = useStyles();

// TODO: Simplify this to store the ID and HelmRelease
  const data = helmReleases.map(hr => {
    return {
      // make material-table happy and add an id to each row
      // FIXME: maybe we can tell material-table to use a custome key?
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

  return (
    <Table
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
