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
} from '../helpers';
import { FluxEntityTable } from '../FluxEntityTable';
import { FluxController } from '../../objects';

export const defaultColumns: TableColumn<Cluster>[] = [
  idColumn(),
  clusterColumn(),
  namespaceColumn(),
  versionColumn(),
  availableComponentsColumn(),
];

type Props = {
  deployments: FluxController[];
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
      cluster => cluster.name === deployment.clusterName,
    );
    if (cls) {
      cls.availableComponents = [
        ...cls.availableComponents,
        deployment.labels['app.kubernetes.io/component'],
      ];
    } else {
      clusters = [
        ...clusters,
        {
          name: deployment.clusterName,
          namespace: deployment.namespace,
          version: deployment.labels['app.kubernetes.io/version'],
          availableComponents: [
            deployment.labels['app.kubernetes.io/component'],
          ],
        },
      ];
    }
  });

  const data = clusters.map(c => {
    const { name, namespace, version, availableComponents } = c;
    return {
      id: `${namespace}/${name}`,
      name,
      namespace,
      version,
      availableComponents,
    } as Cluster & { id: string };
  });

  return (
    <FluxEntityTable
      columns={columns}
      data={data as Cluster[]}
      isLoading={isLoading}
      filters={filters}
      many={many}
    />
  );
};
