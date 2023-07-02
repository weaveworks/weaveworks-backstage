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
  line-height: 1.5em;
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

// generate a string comparison function given an fn
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

// Objects we know how to generate a link for.
export type LinkableFluxObject = HelmRelease | GitRepository | OCIRepository;

export const nameAndClusterNameColumn = <T extends LinkableFluxObject>() => {
  const formatContent = (item: LinkableFluxObject) =>
    `${item.namespace}/${item.name}/${item.clusterName}`;

  return {
    title: 'Name',
    render: resource => nameAndClusterName({ resource }),
    customFilterAndSearch: stringCompareFilter(resource =>
      formatContent(resource),
    ),
    customSort: stringCompareSort(item => formatContent(item)),
  } as TableColumn<T>;
};

export const verifiedColumn = <T extends GitRepository | OCIRepository>() => {
  return {
    title: 'Verified',
    customSort: stringCompareSort(
      resource => findVerificationCondition(resource)?.status,
    ),
    render: resource => verifiedStatus({ resource }),
  } as TableColumn<T>;
};

export const urlColumn = <T extends GitRepository | OCIRepository>() => {
  return {
    title: 'URL',
    render: resource => (
      <UrlWrapper title={resource.url}>{resource.url}</UrlWrapper>
    ),
    field: 'url',
    searchable: true,
  } as TableColumn<T>;
};

export const tagColumn = <T extends GitRepository | OCIRepository>(
  title: string,
) => {
  const formatContent = (resource: GitRepository | OCIRepository) =>
    resource.artifact?.revision.split('@')[0];
  return {
    title: title,
    customSort: stringCompareSort(resource => formatContent(resource)),
    customFilterAndSearch: stringCompareFilter(resource =>
      formatContent(resource),
    ),
    render: resource => <span>{formatContent(resource)}</span>,
    field: 'revision',
  } as TableColumn<T>;
};

export function statusColumn<T extends FluxObject>() {
  return {
    title: 'Status',
    customSort: stringCompareSort(
      resource =>
        getIndicatorInfo(resource.suspended, resource.conditions).type,
    ),
    customFilterAndSearch: stringCompareFilter(
      resource =>
        getIndicatorInfo(resource.suspended, resource.conditions).type,
    ),
    render: resource => (
      <KubeStatusIndicator
        short
        conditions={resource.conditions}
        suspended={resource.suspended}
      />
    ),
  } as TableColumn<T>;
}

export const updatedColumn = <T extends FluxObject>() => {
  return {
    title: 'Updated',
    customSort: stringCompareSort(resource => automationLastUpdated(resource)),
    render: resource =>
      DateTime.fromISO(automationLastUpdated(resource)).toRelative({
        locale: 'en',
      }),
  } as TableColumn<T>;
};
