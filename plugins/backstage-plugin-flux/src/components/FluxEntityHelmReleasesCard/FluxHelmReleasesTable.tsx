import React, { useMemo } from 'react';
import { Typography } from '@material-ui/core';
import { Table, TableColumn } from '@backstage/core-components';
import { useStyles } from '../utils';
import {
  Id,
  NameAndClusterNameColumn,
  StatusColumn,
  UpdatedColumn,
} from '../helpers';
import { HelmRelease } from '../../objects';

export const defaultColumns: TableColumn<HelmRelease>[] = [
  Id(),
  NameAndClusterNameColumn(),
  {
    title: 'Chart',
    field: 'helmChart.chart',
    render: (hr: HelmRelease) => {
      return `${hr.helmChart.chart}/${hr.lastAppliedRevision}`;
    },
  },
  StatusColumn(),
  UpdatedColumn(),
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
    const {
      clusterName,
      namespace,
      name,
      helmChart,
      conditions,
      suspended,
      type,
      lastAppliedRevision,
    } = hr;
    return {
      id: `${clusterName}/${namespace}/${name}`,
      conditions,
      suspended,
      name,
      namespace,
      helmChart,
      lastAppliedRevision,
      clusterName,
      type,
    } as HelmRelease & { id: string };
  });

  return useMemo(() => {
    return (
      <Table
        columns={columns}
        options={{ padding: 'dense', paging: true, search: true, pageSize: 5 }}
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
