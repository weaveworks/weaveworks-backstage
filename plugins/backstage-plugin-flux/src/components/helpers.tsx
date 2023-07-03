import React from 'react';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { Link, Progress, TableColumn } from '@backstage/core-components';
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
  HelmRepository,
  OCIRepository,
} from '../objects';
import Flex from './Flex';
import KubeStatusIndicator, { getIndicatorInfo } from './KubeStatusIndicator';

export type Source = GitRepository | OCIRepository | HelmRepository;
export type Deployment = HelmRelease;
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

export const Url = ({
  resource,
}: {
  resource: Source;
}): JSX.Element => {
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
          >
            <RetryIcon />
          </IconButton>
        )}
      </div>
    </Tooltip>
  );
}

export function syncColumn<T extends Source | Deployment >() {
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
  const classes = useStyles();

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
      <div className={classes.iconCircle}>
        <VerifiedUserIcon style={{ color, height: '16px' }} />
      </div>
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
    <span>{resource.clusterName}</span>
  </Flex>
);

export const idColumn = <T extends FluxObject>() => {
  return {
    title: 'id',
    field: 'id',
    hidden: true,
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
  } as TableColumn<T>;
};

export const verifiedColumn = <T extends GitRepository | OCIRepository>() => {
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
        title={resource.artifact?.revision.split('@')[1] || 'unknown tag'}
      >
        <span>{resource.artifact?.revision.split('@')[0]}</span>
      </Tooltip>
    ),
    ...sortAndFilterOptions(resource => resource.artifact?.revision),
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
  } as TableColumn<T>;
}

export const updatedColumn = <T extends FluxObject>() => {
  return {
    title: 'Updated',
    render: resource =>
      DateTime.fromISO(automationLastUpdated(resource)).toRelative({
        locale: 'en',
      }),
    ...sortAndFilterOptions(resource => automationLastUpdated(resource)),
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
