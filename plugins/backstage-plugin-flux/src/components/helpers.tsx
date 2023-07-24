import React from 'react';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import {
  Link,
  Progress,
  TableColumn,
  TableFilter,
} from '@backstage/core-components';
import { Box, IconButton, Tooltip } from '@material-ui/core';
import RetryIcon from '@material-ui/icons/Replay';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { useSyncResource, useWeaveFluxDeepLink } from '../hooks';
import {
  VerifiableSource,
  automationLastUpdated,
  findVerificationCondition,
  useStyles,
} from './utils';
import {
  FluxObject,
  GitRepository,
  HelmRelease,
  Kustomization,
  HelmRepository,
  OCIRepository,
} from '../objects';
import Flex from './Flex';
import KubeStatusIndicator, { getIndicatorInfo } from './KubeStatusIndicator';
import { helm, kubernetes, oci, git } from '../images/icons';

export type Source = GitRepository | OCIRepository | HelmRepository;
export type Deployment = HelmRelease | Kustomization;
/**
 * Calculate a Name label for a resource with the namespace/name and link to
 * this in Weave GitOps if possible.
 */
export const NameLabel = ({
  resource,
}: {
  resource: FluxObject;
}): JSX.Element => {
  const { name, namespace } = resource;
  const deepLink = useWeaveFluxDeepLink(resource);
  const label = `${namespace}/${name}`;
  const classes = useStyles();

  if (!deepLink) {
    return (
      <span className={classNames(classes.textOverflow, classes.nameLabel)}>
        {label}
      </span>
    );
  }

  return (
    <Link
      className={classNames(classes.textOverflow, classes.nameLabel)}
      to={deepLink}
    >
      {label}
    </Link>
  );
};

export const Url = ({ resource }: { resource: Source }): JSX.Element => {
  const classes = useStyles();
  return (
    <Tooltip title={resource.url}>
      <Box className={classes.textOverflow}>{resource.url}</Box>
    </Tooltip>
  );
};

export function SyncButton({ resource }: { resource: Source | Deployment }) {
  const { sync, isSyncing } = useSyncResource(resource);
  const classes = useStyles();
  const label = `${resource.namespace}/${resource.name}`;
  const title = isSyncing ? `Syncing ${label}` : `Sync ${label}`;

  return (
    <Tooltip title={title}>
      {/* <Progress /> can't handle forwardRef (?) so we wrap in a div */}
      <div>
        {isSyncing ? (
          <Progress data-testid="syncing" />
        ) : (
          <IconButton
            data-testid={`sync ${label}`}
            className={classes.syncButton}
            size="small"
            onClick={sync}
            disabled={resource.suspended}
          >
            <RetryIcon />
          </IconButton>
        )}
      </div>
    </Tooltip>
  );
}

export function syncColumn<T extends Source | Deployment>() {
  return {
    title: 'Sync',
    render: row => <SyncButton resource={row} />,
    width: '24px',
  } as TableColumn<T>;
}

export const VerifiedStatus = ({
  resource,
}: {
  resource: VerifiableSource;
}): JSX.Element | null => {
  if (!resource.isVerifiable) return null;

  const condition = findVerificationCondition(resource);

  let color;
  if (condition?.status === 'True') {
    color = '#27AE60';
  } else if (condition?.status === 'False') {
    color = '#BC3B1D';
  } else if (!condition?.status) {
    color = '#FEF071';
  }

  return (
    <Tooltip title={condition?.message || 'pending verification'}>
      <VerifiedUserIcon style={{ color, height: '16px' }} />
    </Tooltip>
  );
};

export const nameAndClusterName = ({
  resource,
}: {
  resource: FluxObject;
}): JSX.Element => (
  <Flex column>
    <NameLabel resource={resource} />
    <span>cluster: {resource.clusterName}</span>
  </Flex>
);

export const idColumn = <T extends FluxObject>() => {
  return {
    title: 'Id',
    field: 'id',
    hidden: true,
  } as TableColumn<T>;
};

// Added hidden column to allow checkbox filtering by clusterName
export const clusterNameFilteringColumn = <T extends FluxObject>() => {
  return {
    title: 'Cluster name',
    hidden: true,
    field: 'clusterName',
  } as TableColumn<T>;
};

export const nameAndClusterNameColumn = <T extends FluxObject>() => {
  return {
    title: 'Name',
    render: resource => nameAndClusterName({ resource }),
    ...sortAndFilterOptions(
      resource =>
        `${resource.namespace}/${resource.name}/${resource.clusterName}`,
    ),
    minWidth: '200px',
  } as TableColumn<T>;
};

export const verifiedColumn = <T extends Source>() => {
  return {
    title: (
      <Tooltip title="Verification status">
        <VerifiedUserIcon style={{ height: '16px' }} />
      </Tooltip>
    ),
    render: resource => <VerifiedStatus resource={resource} />,
    ...sortAndFilterOptions(resource =>
      resource.isVerifiable
        ? findVerificationCondition(resource)?.status || 'unknown'
        : '',
    ),
    ...sortAndFilterOptions(resource => {
      const condition = findVerificationCondition(resource);
      return condition?.message || '';
    }),
    width: '90px',
  } as TableColumn<T>;
};

export const urlColumn = <T extends Source>() => {
  return {
    title: 'URL',
    field: 'url',
    render: resource => <Url resource={resource} />,
  } as TableColumn<T>;
};

export const artifactColumn = <T extends Source>() => {
  return {
    title: 'Artifact',
    render: resource => (
      <Tooltip
        // This is the sha of the commit that the artifact was built from
        title={
          resource.artifact?.revision?.split('@')[1] ||
          resource.artifact?.revision?.split('@')[0] ||
          'unknown tag'
        }
      >
        <span>{resource.artifact?.revision?.split('@')[0]}</span>
      </Tooltip>
    ),
    ...sortAndFilterOptions(resource => resource.artifact?.revision),
    ...sortAndFilterOptions(
      resource => resource.artifact?.revision?.split('@')[1],
    ),
  } as TableColumn<T>;
};

export const sourceColumn = <T extends Deployment>() => {
  const formatContent = (resource: Deployment) => {
    if (resource.type === 'HelmRelease') {
      return `${(resource as HelmRelease)?.helmChart?.chart}/${
        resource?.lastAppliedRevision
      }`;
    }
    return '';
  };

  return {
    title: 'Source',
    render: (resource: Deployment) =>
      resource.type === 'HelmRelease' ? (
        formatContent(resource)
      ) : (
        <span>
          {resource.type === 'Kustomization'
            ? (resource as Kustomization)?.path
            : ''}
        </span>
      ),
    ...sortAndFilterOptions(resource =>
      resource.type === 'HelmRelease'
        ? formatContent(resource)
        : (resource as Kustomization)?.path,
    ),
  } as TableColumn<T>;
};

export const getIconType = (type: string) => {
  switch (type) {
    case 'HelmRelease':
    case 'HelmRepository':
      return helm;
    case 'Kustomization':
      return kubernetes;
    case 'GitRepository':
      return git;
    case 'OCIRepository':
      return oci;
    default:
      return null;
  }
};

export const typeColumn = <
  T extends Deployment | OCIRepository | GitRepository | HelmRepository,
>() => {
  const paddingLeft = 0;
  return {
    title: 'Kind',
    align: 'right',
    cellStyle: { paddingLeft, paddingRight: 6 },
    headerStyle: { paddingLeft, paddingRight: 0 },

    field: 'type',
    render: resource => (
      <Tooltip title={resource.type || 'Unknown'}>
        <div>{getIconType(resource.type as string)}</div>
      </Tooltip>
    ),
    ...sortAndFilterOptions(resource => resource?.type as string | undefined),
    width: '20px',
  } as TableColumn<T>;
};

export const repoColumn = <T extends Deployment>() => {
  return {
    title: 'Repo',
    field: 'repo',
    render: resource => <span>{resource?.sourceRef?.name}</span>,
    ...sortAndFilterOptions(resource => resource?.sourceRef?.name),
  } as TableColumn<T>;
};

export function statusColumn<T extends FluxObject>() {
  return {
    title: 'Status',
    render: resource => (
      <KubeStatusIndicator
        short
        conditions={resource.conditions}
        suspended={resource.suspended}
      />
    ),
    ...sortAndFilterOptions(
      resource =>
        getIndicatorInfo(resource.suspended, resource.conditions).type,
    ),
    minWidth: '130px',
  } as TableColumn<T>;
}

export const updatedColumn = <T extends FluxObject>() => {
  return {
    title: 'Updated',
    render: resource =>
      DateTime.fromISO(automationLastUpdated(resource)).toRelative({
        locale: 'en',
      }),
    ...sortAndFilterOptions(
      resource =>
        DateTime.fromISO(automationLastUpdated(resource)).toRelative({
          locale: 'en',
        }) as string,
    ),
    minWidth: '130px',
  } as TableColumn<T>;
};

//
// sorting and filtering helpers
//

export function sortAndFilterOptions<T extends object>(
  fn: (item: T) => string | undefined,
) {
  return {
    customFilterAndSearch: stringCompareFilter(fn),
    customSort: stringCompareSort(fn),
  } as TableColumn<T>;
}

export function stringCompareSort<T>(fn: (item: T) => string | undefined) {
  return (a: T, b: T) => {
    return (fn(a) || '').localeCompare(fn(b) || '');
  };
}

export function stringCompareFilter<T>(fn: (item: T) => string | undefined) {
  return (filter: any, item: T) => {
    return (fn(item) || '')
      .toLocaleLowerCase()
      .includes((filter as string).toLocaleLowerCase());
  };
}

// checkbox filters
export const filters: TableFilter[] = [
  {
    column: 'Cluster name',
    type: 'multiple-select',
  },
];
