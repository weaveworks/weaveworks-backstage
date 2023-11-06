import React from 'react';
import { TableColumn } from '@backstage/core-components';
import {
  idColumn,
  filters,
  clusterColumn,
  namespaceColumn,
  versionColumn,
  Cluster,
  availableComponentsColumn,
  clusterNameFilteringColumn,
} from '../helpers';
import { FluxEntityTable } from '../FluxEntityTable';
import { FluxControllerEnriched } from '../../objects';

export const defaultColumns: TableColumn<Cluster>[] = [
  clusterNameFilteringColumn(),
  idColumn(),
  clusterColumn(),
  namespaceColumn(),
  versionColumn(),
  availableComponentsColumn(),
];

type Props = {
  deployments: FluxControllerEnriched[];
  isLoading: boolean;
  columns: TableColumn<Cluster>[];
  many?: boolean;
};

export const FluxRuntimeTable = ({
  deployments,
  isLoading,
  columns,
  many,
}: Props) => {
  let clusters: Cluster[] = [];
  deployments.forEach(deployment => {
    const cls = clusters.find(
      cluster => cluster.clusterName === deployment.clusterName,
    );
    if (cls) {
      cls.availableComponents = [
        ...cls.availableComponents,
        deployment.metadata.labels['app.kubernetes.io/component'],
      ];
    } else {
      clusters = [
        ...clusters,
        {
          clusterName: deployment.clusterName,
          namespace: deployment.metadata.namespace,
          version: deployment.metadata.labels['app.kubernetes.io/version'],
          availableComponents: [
            deployment.metadata.labels['app.kubernetes.io/component'],
          ],
        },
      ];
    }
  });

  const data = clusters.map(c => {
    const { clusterName, namespace, version, availableComponents } = c;
    return {
      id: `${namespace}/${clusterName}`,
      clusterName,
      namespace,
      version,
      availableComponents,
    } as Cluster & { id: string };
  });

  return (
    <FluxEntityTable
      title="flux controllers"
      columns={columns}
      data={data as Cluster[]}
      isLoading={isLoading}
      filters={filters}
      many={many}
    />
  );
};
