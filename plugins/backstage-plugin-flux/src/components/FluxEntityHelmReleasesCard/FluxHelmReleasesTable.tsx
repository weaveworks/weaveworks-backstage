import React from 'react';
import { TableColumn } from '@backstage/core-components';
import {
  idColumn,
  nameAndClusterNameColumn,
  statusColumn,
  stringCompareFilter,
  stringCompareSort,
  syncColumn,
  updatedColumn,
} from '../helpers';
import { HelmRelease } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

function chartColumn() {
  const formatContent = (hr: HelmRelease) =>
    `${hr.helmChart.chart}/${hr.lastAppliedRevision}`;
  return {
    title: 'Chart',
    customSort: stringCompareSort(hr => formatContent(hr)),
    customFilterAndSearch: stringCompareFilter(hr => formatContent(hr)),
    render: (hr: HelmRelease) => formatContent(hr),
  } as TableColumn<HelmRelease>;
}

export const defaultColumns: TableColumn<HelmRelease>[] = [
  idColumn(),
  nameAndClusterNameColumn(),
  chartColumn(),
  statusColumn(),
  updatedColumn(),
  syncColumn(),
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
  // TODO: Simplify this to store the ID and HelmRelease
  const data = helmReleases.map(hr => {
    const {
      clusterName,
      namespace,
      name,
      helmChart,
      conditions,
      suspended,
      sourceRef,
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
      sourceRef,
      type,
    } as HelmRelease & { id: string };
  });

  return (
    <FluxEntityTable
      columns={columns}
      title="Helm Releases"
      data={data}
      isLoading={isLoading}
    />
  );
};
