import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { Link, Progress, TableColumn } from '@backstage/core-components';
import { IconButton, Tooltip } from '@material-ui/core';
import RetryIcon from '@material-ui/icons/Replay';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { SyncResource, useSyncResource, useWeaveFluxDeepLink } from '../hooks';
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
  OCIRepository,
} from '../objects';
import Flex from './Flex';
import KubeStatusIndicator, { getIndicatorInfo } from './KubeStatusIndicator';

const UrlWrapper = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  direction: rtl;
  max-width: 350px;
`;

/**
 * Calculate a Name label for a resource with the namespace/name and link to
 * this in Weave GitOps if possible.
 */
export const NameLabel = ({
  resource,
}: {
  resource: HelmRelease | GitRepository | OCIRepository;
}): JSX.Element => {
  const { name, namespace } = resource;
  const deepLink = useWeaveFluxDeepLink(resource);
  const label = `${namespace}/${name}`;
  const classes = useStyles();

  if (!deepLink) {
    return <span className={classes.nameLabel}>{label}</span>;
  }

  return (
    <Link className={classes.nameLabel} to={deepLink}>
      {label}
    </Link>
  );
};

export function SyncButton({ resource }: { resource: SyncResource }) {
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

export function syncColumn<T extends SyncResource>() {
  return {
    title: 'Sync',
    render: row => <SyncButton resource={row} />,
    width: '24px',
  } as TableColumn<T>;
}

export const verifiedStatus = ({
  resource,
}: {
  resource: VerifiableSource;
}): JSX.Element => {
  const condition = findVerificationCondition(resource);

  let color = '#d8d8d8';
  if (condition?.status === 'True') {
    color = '#27AE60';
  } else if (condition?.status === 'False') {
    color = '#BC3B1D';
  } else if (condition?.status !== undefined) {
    color = '#FEF071';
  }

  return (
    <Tooltip title={condition?.message || ''}>
      <VerifiedUserIcon style={{ color, height: '16px' }} />
    </Tooltip>
  );
};

export const nameAndClusterName = ({
  resource,
}: {
  resource: HelmRelease | GitRepository | OCIRepository;
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

export const nameAndClusterNameColumn = <
  T extends HelmRelease | GitRepository | OCIRepository,
>() => {
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
    title: 'Verified',
    render: resource => verifiedStatus({ resource }),
    ...sortAndFilterOptions(
      resource => findVerificationCondition(resource)?.status,
    ),
  } as TableColumn<T>;
};

export const urlColumn = <T extends GitRepository | OCIRepository>() => {
  return {
    title: 'URL',
    render: resource => (
      <UrlWrapper title={resource.url}>{resource.url}</UrlWrapper>
    ),
    field: 'url',
  } as TableColumn<T>;
};

export const tagColumn = <T extends GitRepository | OCIRepository>(
  title: string,
) => {
  const formatContent = (resource: T) =>
    resource.artifact?.revision.split('@')[0];
  return {
    title: title,
    render: resource => <span>{formatContent(resource)}</span>,
    ...sortAndFilterOptions(resource => formatContent(resource)),
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
